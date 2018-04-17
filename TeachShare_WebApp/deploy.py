#!/usr/bin/env python
# PYTHON_ARGCOMPLETE_OK
import sys
import argcomplete
import argparse
from termcolor import colored, cprint
import subprocess
import yaml
from shutil import copy
from pprint import pprint


class DockerCommandError(Exception):
    def __init__(self, cmd, message):
        self.cmd = cmd
        self.message = message


class Deploy(object):

    def __init__(self):
        cprint('Initializing deployment...', 'green')
        self.deployments = {}

        self.load_config()
        for j in self.config['deployments']:
            print(j)

        parser = argparse.ArgumentParser(description='Build teach-share Django backend for Google Cloud production environment.', usage='''deploy <command> [<args>]
        
        The most commonly used commands are:
            build   Just build the backend assets
            deploy  Just deploy currently built backend assets
            all     Perform a complete deployment
             ''', add_help=False)
        parser.add_argument('command', help='build for production')

        argcomplete.autocomplete(parser)
        self.args = parser.parse_args(sys.argv[1:2])
        if not hasattr(self, self.args.command):
            print('Unrecognized command')
            parser.print_help()
            exit(1)
        getattr(self, self.args.command)()

    def test(self):
        test = 'gcr.io/teach-share-200700/teachshare_web:1.0.2'
        self.parse_deployment_image(test)

        # parser = argparse.ArgumentParser(description='a test command')
        # parser.add_argument('--test', action='store_true')
        # args = parser.parse_args(sys.argv[2:])
        # print('Running command test, --test=%s' % args.test)

    def all(self):
        self.build()
        self.push()
        self.update()

    def update(self):
        cprint('Updating Kubernetes cluster.', color='blue', attrs=['bold'])

    def build(self):
        """
            Build command for deploying to production.
                Args:
                    --settings $settings_file_for_django
        """

        parser = argparse.ArgumentParser(description='build backend assets')
        parser.add_argument('--settings')
        args = parser.parse_args(sys.argv[2:])
        print(args)
        print(args.settings)
        settings_resp = 'DEFAULT (settings.py)'
        settings_path = self.config['settings']
        if str(args.settings) != 'None' and str(args.settings) != '':
            settings_path = args.settings
            settings_resp = args.settings

        # check the current state for the deployments
        cprint('Checking the deployments current state...', color='yellow')

        for dep in self.config['deployments']:
            print('Checking deployment: %s' % dep)
            self.get_deployment_status(dep)
            image = self.deployments[dep]['spec']['template']['spec']['containers'][0]['image']
            new_version = self.parse_deployment_image(image)
            print(new_version)
            self.update_deployment_version(
                dep, new_version, self.config['deployments'][dep]['file'])

        cprint('Running build command, settings=%s' % settings_resp, 'blue')
        print()
        print('\t--> Settings file: "%s"' % settings_path)
        print()
        # images = ['gcr.io/teach-share-200700/teachshare_web', 'gcr.io/teach-share-200700/teachshare_task']
        cprint('Building docker images...', 'blue', attrs=['bold'])

        for k, val in self.config['deployments'].items():
            cprint('Building: %s' % k, color='yellow')
            build_result = self.build_docker_image(
                val['url']+':{}'.format(val['version']), settings_path, val['dockerfile'])
            if build_result.returncode != 0:
                raise DockerCommandError(
                    build_result.args, build_result.stderr)
            else:
                cprint('Finished building docker image: %s' % k, 'green')
        cprint('Finished building all images!', color='green',
               attrs=['bold', 'reverse', 'blink'])

    def push(self):
        parser = argparse.ArgumentParser(description='push backend images')
        parser.add_argument('--settings')
        args = parser.parse_args(sys.argv[2:])
        print(args)
        print(args.settings)
        settings_resp = 'DEFAULT (settings.py)'
        settings_path = 'TeachShare_WebApp.settings'
        if str(args.settings) != 'None' and str(args.settings) != '':
            settings_path = args.settings
            settings_resp = args.settings

        cprint('Running build command, settings=%s' % settings_resp, 'blue')
        print()
        print('\t--> Settings file: "%s"' % settings_path)
        print()
        cprint('Building docker images...', 'blue', attrs=['bold'])

        for k, val in self.config['deployments'].items():
            cprint('Uploading: {}'.format(k), color='yellow')
            build_result = self.push_docker_image(
                val['url']+':{}'.format(val['version']))
            if build_result.returncode != 0:
                raise DockerCommandError(
                    build_result.args, build_result.stderr)
            else:
                cprint('Finished pushing docker image: %s' % k, 'green')
        cprint('Finished pushing all images!', color='green',
               attrs=['bold', 'reverse', 'blink'])

    def load_config(self):
        with open('backend_deploy.yml', 'r') as ymlfile:
            self.config = yaml.load(ymlfile)
        print(self.config)
        # self.load_deployment('config/production/k8s/web/api-deployment.yml')

    def build_docker_image(self, image_name, settings='TeachShare_WebApp.settings', dockerfile='config/production/production.web.yml'):
        s = 'settings_module={}'.format(settings)
        print('******************')
        print(s)
        print('******************')
        result = subprocess.run(['docker', 'build', '-f', dockerfile, '--build-arg',
                                 s, '-t', image_name, '.'])
        cprint(result, 'blue')
        return result

    def push_docker_image(self, image_name):
        result = subprocess.run(['docker', 'push', image_name])
        cprint(result, 'blue')
        return result

    # def load_deployment(self, filename):
    #     with open(filename, 'r') as deployment_file:
    #         self.deployment = yaml.load(deployment_file)
    #     self.deployed_image = self.deployment['spec']['template']['spec']['containers'][0]['image']
    #     print(self.deployed_image)
        # FIXME: fix it
        # self.update_deployment_version('1.0.1', filename)

    def update_deployment_version(self, name, new_version, filename):
        # print(self.deployed_image, new_version)
        # split_version = self.deployed_image.split(':')
        # self.deployed_image = split_version[0] + ':{}'.format(new_version)
        # print(self.deployed_image)

        # write to actual deployment
        self.deployments[name]['spec']['template']['spec']['containers'][0]['image'] = new_version
        with open(filename, 'w') as deployment_file:
            yaml.dump(self.deployments[name], deployment_file)

        # write to configuration file
        self.config['deployments']['api-production']['version'] = new_version.split(':')[
            1]
        self.config['deployments']['celery-task']['version'] = new_version.split(':')[
            1]
        with open('backend_deploy.yml', 'w') as ymlfile:
            yaml.dump(self.config, ymlfile)

    # kubectl get deployment api-production -o yaml
    def get_deployment_status(self, deployment_name='api-production'):
        result = subprocess.check_output(['kubectl', 'get', 'deployment',
                                          deployment_name, '-o', 'yaml'])
        status = yaml.load(result)
        pprint(status)
        print(status['spec']['template']['spec']['containers'][0]['image'])

        # set instance variables
        # self.current_image = status['spec']['template']['spec']['containers'][0]['image']
        self.deployments[deployment_name] = status
        print(self.deployments)

    def parse_deployment_image(self, image):
        result = image.split(':')[1]
        result = int(result.split('.')[2])
        arr = [a for a in image.split(':')[1].split('.')]
        arr[2] = str(result+1)
        out = image.split(':')[0] + ':' + '.'.join(arr)
        print(out)
        return out

    def create(self):
        parser = argparse.ArgumentParser(
            description='create a Kubernetes deployment')
        parser.add_argument('-f')
        args = parser.parse_args(sys.argv[2:])
        print(args)

    # kubectl create -f config/production/k8s/celery-task.yml
    def create_deployment(self, filepath):
        result = subprocess.run(['kubectl', 'create', '-f', filepath])
        print(result)


if __name__ == '__main__':
    try:
        Deploy()
    except DockerCommandError as err:
        cprint('There was an error performing a docker command: %s, while running "%s"' % (
            err.message, " ".join(err.cmd)))

    # result = subprocess.run(['ls', '-la'], stdout=subprocess.PIPE)
    # output_lines = str(result.stdout.decode('utf-8')).split('\n')
    # for l in output_lines:
    #     print(l)
