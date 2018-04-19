import time
import asyncio
import random
import requests

async def do_some_work(x):
    print("Waiting " + str(x))
    await asyncio.sleep(x)

async def get_url(url):
    future1 = loop.run_in_executor(None, requests.get, url)
    resp = await future1
    return resp.json()

# loop = asyncio.get_event_loop()

# tasks = [asyncio.ensure_future(do_some_work(1)),
#          asyncio.ensure_future(do_some_work(1))]

# loop.run_until_complete(asyncio.gather(*tasks))

# test_url = 'https://goalbookapp.com/toolkit/api/search/*?grades%5B%5D=K&grades%5B%5D=Pre-K&grades%5B%5D=1&grades%5B%5D=2&grades%5B%5D=3&grades%5B%5D=4&grades%5B%5D=5&grades%5B%5D=6&grades%5B%5D=7&grades%5B%5D=8&grades%5B%5D=9&grades%5B%5D=10&grades%5B%5D=11&grades%5B%5D=12&subjects%5B%5D=Reading&user_type=default&new_search=true'

# loop.run_until_complete(get_url(test_url))

# queue = asyncio.Queue(loop=loop)
# queue.put(test_url)
# print(queue)

# async def consumer(data, q):
#     item = await q.get()
#     print(item)
#     return item

# async def producer()
# loop.run_until_complete(test('string', queue))

from urllib import parse
import json
import pandas as pd

async def produce(queue, urls):
    for x in urls:
        # produce an item
        print('producing {}\n\n'.format(x))
        await queue.put(x)

    # indicate the producer is done
    await queue.put(None)

async def consume(queue):
    while True:
        # wait for an item from the producer
        # print(queue.length())
        item = await queue.get()
        if item is None:
            # the producer emits None to indicate that it is done
            break

        # process the item
        # print('consuming item {}...\n\n'.format(item))
        future1 = loop.run_in_executor(None, requests.get, item)
        resp = await future1
        out = resp.json()
        query = parse.urlsplit(item).query
        params = parse.parse_qs(query)

        panda_data = pd.DataFrame(out['goals'], columns=[x for x in out['goals'][0].keys()])
        panda_data.to_csv('{}.csv'.format(''.join(params['subjects[]'])))
        print(panda_data)
        # print(params)
        # print(out.keys)
        print('{}'.format(''.join(params['subjects[]']) + ': ' + str(len(out['goals']))))
        with open('goalbook-{}.json'.format(''.join(params['subjects[]'])), 'w') as f:
            f.write(json.dumps(out, sort_keys=True, indent=4))
        
'https://goalbookapp.com/pathways/api/v1/items/bffa4784-6dc2-4a58-6116-80ddf32984e5?denormalized=1'

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

loop = asyncio.get_event_loop()
queue = asyncio.Queue(loop=loop)
producer_coro = produce(queue, urls)
consumer_coro = consume(queue)
loop.run_until_complete(asyncio.gather(producer_coro, consumer_coro))
loop.close()

# print(outdict.keys())
# # print(outdict.items())
# print(outdict[urls[0]])