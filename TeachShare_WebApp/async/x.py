import requests
import csv
import collections
from urllib import parse
import json

urls = [
    'https://goalbookapp.com/toolkit/api/search/*?grades%5B%5D=K&grades%5B%5D=Pre-K&grades%5B%5D=1&grades%5B%5D=2&grades%5B%5D=3&grades%5B%5D=4&grades%5B%5D=5&grades%5B%5D=6&grades%5B%5D=7&grades%5B%5D=8&grades%5B%5D=9&grades%5B%5D=10&grades%5B%5D=11&grades%5B%5D=12&subjects%5B%5D=Reading&user_type=default&new_search=true',
    'https://goalbookapp.com/toolkit/api/search/*?subjects%5B%5D=Writing&user_type=default&new_search=true',
    'https://goalbookapp.com/toolkit/api/search/*?subjects%5B%5D=Math&user_type=default&new_search=true',
    'https://goalbookapp.com/toolkit/api/search/*?subjects%5B%5D=Behavior+%26+SEL&user_type=default&new_search=true',
    'https://goalbookapp.com/toolkit/api/search/*?subjects%5B%5D=Pre-Kindergarten&user_type=default&new_search=true',
    'https://goalbookapp.com/toolkit/api/search/*?subjects%5B%5D=English+Learners&user_type=default&new_search=true',
    'https://goalbookapp.com/toolkit/api/search/*?subjects%5B%5D=Autism&user_type=default&new_search=true',
    'https://goalbookapp.com/toolkit/api/search/*?subjects%5B%5D=Speech+%26+Language&user_type=default&new_search=true',
    'https://goalbookapp.com/toolkit/api/search/*?subjects%5B%5D=Success+Skills&user_type=default&new_search=true',
    'https://goalbookapp.com/toolkit/api/search/*?subjects%5B%5D=Blind%2FVisual+Impairment&user_type=default&new_search=true',
    'https://goalbookapp.com/toolkit/api/search/*?subjects%5B%5D=Adapted+Physical+Education&user_type=default&new_search=true',
    'https://goalbookapp.com/toolkit/api/search/*?subjects%5B%5D=Deaf%2FHard+of+Hearing&user_type=default&new_search=true',
    'https://goalbookapp.com/toolkit/api/search/*?subjects%5B%5D=Occupational+Therapy&user_type=default&new_search=true',
    'https://goalbookapp.com/toolkit/api/search/*?subjects%5B%5D=Alt+Academic+%26+Life+Skills&user_type=default&new_search=true',
    'https://goalbookapp.com/toolkit/api/search/*?subjects%5B%5D=Transition&user_type=default&new_search=true',
]

assessment_items = {
    'images',
    'resources'
}

keep_fields = {
    'goal_text',
    'grades',
    'objectives',
    'standard_codes',
    'subject',
    'subject_domains',
    'title',
    'udl_adaptations',
    'assessment_items'
}

objectives = {
    'level',
    'text'
}

udl_adaptations = {
    'text',
    'udl_standard_long_ref'
}

# I know a lot of the names are innapropriate. But I kinda doubt nobody knows
# and frankly this is throway scraping code.

def get_name(url):
    query = parse.urlsplit(url).query
    params = parse.parse_qs(query)
    qs = (params['subjects[]'])
    qs = qs[0].replace('/', '')
    qs = parse.quote_plus(qs)
    print(qs)
    return qs

def get_url_json(url):
    j = requests.get(url).json()['goals']
    qs = get_name(url)
    with open('{}.json'.format(qs), 'w') as f:
        f.write(json.dumps(j, sort_keys=True, indent=4))
    return [a for a in j]

def get_ass(key):
    print('key: {}'.format(key))
    url = 'https://goalbookapp.com/pathways/api/v1/items/{}?denormalized=1'.format(key)
    results = requests.get(url)
    return results.json()



def flatten(d, parent_key='', sep='_'):
    items = []
    for k, v in d.items():
        new_key = parent_key + sep + k if parent_key else k
        if isinstance(v, collections.MutableMapping):
            items.extend(flatten(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)

allkeys = set({})

if __name__ == '__main__':
    print('test')
    subjects = { get_name(a): get_url_json(a) for a in urls }
    print(len(subjects))
    print(subjects.keys())
    outer = {}
    for subj_k, i in subjects.items():
        print(subj_k)
        output = []
        for entries in i:
            cleaned = {k: v for k, v in entries.items() if k in keep_fields}
            # print('VAL: ', cleaned.keys())
            if 'assessment_items' in cleaned.keys():
                if len(cleaned['assessment_items'].keys()) > 0:
                    for k, ass_item in cleaned['assessment_items'].items():
                        assessment = get_ass(ass_item[0])
                        cleaned['assessment_items'] = {k: assessment[k] for k in assessment.keys() & assessment_items }
                        # print(cleaned.keys())

            obj = flatten({ 'objective_{}'.format(index): { b: a[b] for b in a.keys() if b in objectives } for index, a in enumerate(cleaned['objectives']) })
            cleaned['objectives'] = obj
            
            udl = ''
            if 'udl_adaptations' in cleaned:
                adapt = cleaned['udl_adaptations']
                # print(len(adapt), len(entries))
                udl = flatten({ 'udl_adaptations_{}'.format(index): { b: a[b] for b in a.keys() if b in udl_adaptations } for index, a in enumerate(adapt) })
                # print('UDL: ', udl)
            cleaned['udl_adaptations'] = udl 
            # print('UDL: ', cleaned['udl_adaptations'])
            flat = flatten(cleaned)
            # allkeys.extend(flat.keys())
            s = { a for a in flat.keys() }
            allkeys = set(allkeys).union(s)
            
            # print('KEYS: ', allkeys)
            output.append(flat)
            cleaned = flat
            
            if 'objectives' in cleaned:
                del(cleaned['objectives'])
                allkeys.remove('objectives')
            if 'udl_adaptations' in cleaned:
                del(cleaned['udl_adaptations'])
                allkeys.remove('udl_adaptations')
            output.append(cleaned)
        print(subj_k)
        outer[subj_k] = output
    
    out_keys_sorted = []
    for key in sorted(allkeys):
        out_keys_sorted.append(key)
        print(key)
    

    print('**********************')
    print(outer.keys())
    counter = 0
    for k, a in outer.items():
        with open('{}.csv'.format(k), 'w') as csvfile:
            wr = csv.DictWriter(csvfile, fieldnames=out_keys_sorted)
            wr.writeheader()

            for b in a:
                wr.writerow(b)

        counter+=1