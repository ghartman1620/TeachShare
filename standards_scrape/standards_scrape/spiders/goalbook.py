# -*- coding: utf-8 -*-
import scrapy
from pprint import pprint 

urls = [
    # 'https://goalbookapp.com/toolkit/browse#?subjects=Reading&new_search=true',
    'https://goalbookapp.com/toolkit/browse#?subjects=Writing&new_search=true',
    'https://goalbookapp.com/toolkit/browse#?subjects=Math&new_search=true',
    'https://goalbookapp.com/toolkit/browse#?subjects=Behavior%20%26%20SEL&new_search=true',
    'https://goalbookapp.com/toolkit/browse#?subjects=Pre-Kindergarten&new_search=true',
    'https://goalbookapp.com/toolkit/browse#?subjects=English%20Learners&new_search=true',
    'https://goalbookapp.com/toolkit/browse#?subjects=Autism&new_search=true',
    'https://goalbookapp.com/toolkit/browse#?subjects=Speech%20%26%20Language&new_search=true',
    'https://goalbookapp.com/toolkit/browse#?subjects=Success%20Skills&new_search=true',
    'https://goalbookapp.com/toolkit/browse#?subjects=Blind%2FVisual%20Impairment&new_search=true',
    'https://goalbookapp.com/toolkit/browse#?subjects=Adapted%20Physical%20Education&new_search=true',
    'https://goalbookapp.com/toolkit/browse#?subjects=Deaf%2FHard%20of%20Hearing&new_search=true',
    'https://goalbookapp.com/toolkit/browse#?subjects=Occupational%20Therapy&new_search=true',
    'https://goalbookapp.com/toolkit/browse#?subjects=Alt%20Academic%20%26%20Life%20Skills&new_search=true',
    'https://goalbookapp.com/toolkit/browse#?subjects=Transition&new_search=true'
]

class GoalbookSpider(scrapy.Spider):
    name = 'goalbook'
    allowed_domains = ['goalbookapp.com']
    start_urls = ['https://goalbookapp.com/accounts/users/sign_in']

    def start_requests(self):
        return [scrapy.FormRequest('https://goalbookapp.com/accounts/users/sign_in', 
                formdata={'email': 'nleal@sccs.net','password': '1prince1', 'timezone': 'America/Los_Angeles'}, 
                callback=self.logged_in)]

    def parse(self, response):
        self.log('in parse...')
        

    def logged_in(self, response):
        print(response)
        self.log(response)
        return  [scrapy.Request(url=url, callback=self.post_parse, dont_filter=True) for url in urls]
        
    def post_parse(self, response):
        self.log('in post parse...')
        self.log(response.xpath('//*[@id="result-goals"]'))

        for li in response.xpath('//*[@id="result-goals"]'):
            self.log(li)
