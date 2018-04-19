# -*- coding: utf-8 -*-

# Define here the models for your scraped items
#
# See documentation in:
# https://doc.scrapy.org/en/latest/topics/items.html

import scrapy

class Goal(scrapy.Item):
    title = scrapy.Field()
    key_standard = scrapy.Field()
    annual_target = scrapy.Field()
    quarterly_objectives = scrapy.Field()
    grade_levels = scrapy.Field()
    referenced_strategies = scrapy.Field()
    udl_aligned_strategies = scrapy.Field()
