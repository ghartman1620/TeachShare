import requests
import csv
import collections

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
    '_id',
    'level',
    'text'
}

udl_adaptations = {
    '_id',
    'text',
    'udl_standard_long_ref'
}

# I know a lot of the names are innapropriate. But I kinda doubt nobody knows
# and frankly this is throway scraping code.

def get_url_json(url):
    return [a for a in requests.get(url).json()['goals']]

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


if __name__ == '__main__':
    print('test')
    subjects = [get_url_json(a) for a in urls]
    print(len(subjects))
    outer = []
    for i in subjects:
        output = []
        for entries in i:
            cleaned = {k: v for k, v in entries.items() if k in keep_fields}
            print('VAL: ', cleaned.keys())
            if 'assessment_items' in cleaned.keys():
                if len(cleaned['assessment_items'].keys()) > 0:
                    for k, ass_item in cleaned['assessment_items'].items():
                        assessment = get_ass(ass_item[0])
                        cleaned['objectives'] = flatten({k: v for k, v in cleaned.items() if k in objectives })
                        cleaned['udl_adaptations'] = flatten({k: v for k, v in cleaned.items() if k in udl_adaptations })
                        cleaned['assessment_items'] = {k: assessment[k] for k in assessment.keys() & assessment_items }
                        output.append(cleaned)
                        print(cleaned.keys())
                else:
                    print('EMPTY')
            else:
                output.append(cleaned)
                print('NOPE')
                print()
                print()
            # print(output)
        outer.append(output)
    
    counter = 0
    for a in outer:

        with open('{}.csv'.format(counter), 'w') as csvfile:
            wr = csv.DictWriter(csvfile, fieldnames=keep_fields)
            wr.writeheader()

            for b in a:
                wr.writerow(b)

        counter+=1