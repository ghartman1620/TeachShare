from typing import Iterable, Iterator, List, Generator, Dict
import time
from contextlib import contextmanager
import requests


def test(names: Iterable[str]) -> List[str]:
    val = "something" # type: str
    return [val,]

def test2(names):
    # type: (Iterable[str]) -> List[str]
    """ This is a docstring """
    val: str = "something"
    return [val,]

@contextmanager
def get(url: str) -> Iterator[dict]:
    try:
        resp: requests.models.Response = requests.get(url)
        yield resp.json()
    finally:
        resp.close()
        print('closed resp.')

if __name__ == "__main__":
    res = test(['one', 'two'])
    print(res)

    res = test(['one', 'two'])
    print(res)

    val: str = "another"
    print(val, type(val))
    with get('https://goalbookapp.com/toolkit/api/search/*?subjects%5B%5D=Transition&user_type=default&new_search=true') as v:
        print(v)
    

