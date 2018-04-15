#!/usr/bin/env python
# PYTHON_ARGCOMPLETE_OK
import sys
import argcomplete
import argparse
from termcolor import colored, cprint
import subprocess
import yaml
from shutil import copy


class DockerCommandError(Exception):
    def __init__(self, cmd, message):
        self.cmd = cmd
        self.message = message


class Deploy(object):

    def __init__(self):
        cprint('Initializing deployment...', 'green')

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
        parser = argparse.ArgumentParser(description='a test command')
        parser.add_argument('--test', action='store_true')
        args = parser.parse_args(sys.argv[2:])
        print('Running command test, --test=%s' % args.test)

    def all(self):
        self.build()
        self.push()

    def build(self):
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

        cprint('Running build command, settings=%s' % settings_resp, 'blue')
        print()
        print('\t--> Settings file: "%s"' % settings_path)
        print()
        # images = ['gcr.io/teach-share-200700/teachshare_web', 'gcr.io/teach-share-200700/teachshare_task']
        cprint('Building docker images...', 'blue', attrs=['bold'])

        for k, val in self.config['deployments'].items():
            cprint('Building: %s' % k, color='yellow')
            build_result = self.build_docker_image(val['url']+':{}'.format(val['version']), settings_path, val['dockerfile'])
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
            build_result = self.push_docker_image(val['url']+':{}'.format(val['version']))
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
