from posts.models import Standard

def makeStandardFromJSON(path):
    from json import loads
    with open(path, "r") as f:
        obj = loads(f.read())
        for std in obj:
            #only use standards with standard codes
            try:

                #starting off with objects that only have one standard. 
                #in these, the title definitely corresponds to what the standard is about.
                #But in some objects with more than one standard some of the standards aren't necessarily relevant
                #to the title.

                #we'll see how far this gets us through the list of standards. But dealing with the 
                #objects from goalbookapp isn't the way to go on other standards that aren't mapped 1:1 to a goalbookapp
                #object.
                if len(std['standard_codes']) == 1:
                    createdHSStandard = False
                    for grade in std['grades']:
                        if grade == "K":
                            Standard.objects.create(
                                grade=1,
                                subject=1,
                                name=std['title'],
                                description=std['goal_text'],
                                category=std['subject_domains'][0] if len(std['subject_domains']) > 0 else 'N/A',
                                code=std['standard_codes'][0]
                            )
                        elif grade == "Pre-K":
                            Standard.objects.create(
                                grade=0,
                                subject=1,
                                name=std['title'],
                                description=std['goal_text'],
                                category=std['subject_domains'][0] if len(std['subject_domains']) > 0 else 'N/A',
                                code=std['standard_codes'][0]
                            )


                        #High school standards are all the same in our system.
                        #this is due to math, however, ELA is a bit different, so we can decide to change this in the future.
                        #This isn't especially difficult - just add other grades to the options within models and do this 
                        #work again but update models instead of creating new ones.
                        elif int(grade) > 8:
                            if not createdHSStandard:
                                Standard.objects.create(
                                    grade=10,
                                    subject=1,
                                    name=std['title'],
                                    description=std['goal_text'],
                                    category=std['subject_domains'][0] if len(std['subject_domains']) > 0 else 'N/A',
                                    code=std['standard_codes'][0]
                                )

                                createdHSStandard = True
                        #will create one standard object for each non-HS grade related to a standard, 
                        #since some are labeled like 3-5 or something liek that.
                        else:

                            Standard.objects.create(
                                grade=int(grade)+1,
                                subject=1,
                                name=std['title'],
                                description=std['goal_text'],
                                category=std['subject_domains'][0] if len(std['subject_domains']) > 0 else 'N/A',
                                code=std['standard_codes'][0]
                            )
                
                    #some have multiple - we'll create a Standard object for each
            except KeyError:
                pass #this standard doesn't have key standard codes, that's ok we just won't use it

