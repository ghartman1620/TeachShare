import os, json
def walk(obj, cwd):
    for path in os.listdir(cwd):
        if cwd != '.':
            path = str(cwd) + "/" + path
        if(os.path.isfile(path)):
            #print("adding file" + str(path))
            obj.append({
                'name': str(path), 
                'size': str(os.stat(path).st_size)
            })
        else:
            #is dir
            #print("entering directory" + str(path))
            directory = []
            walk(directory, str(path))
            obj.append({
                'name' : str(path),
                'size' : 0,
                'children' : directory
            })

d = []
walk(d, ".")
#print(d)
f = open("filesys.json", "w")

f.write(json.dumps({'name' : os.getcwd(), 'size' : '0', 'children' : d}, indent=4, separators=(',', ': ')))