import json
import requests
import re

Verbose = False

urlbase = ''
presiSearch = re.compile( r'(title=")(.[^"]*)(">)',re.DOTALL)
hrefSearch  = re.compile( r'(href=")(.[^"]*)(" )',re.DOTALL)
nameSearch  = re.compile( r'(<h1>)(.[^<]*)(</h1>)',re.DOTALL)
termSearch  = re.compile( r'(/b>\)|pan>)(.[^<]*)(.*)',re.DOTALL)

# Term examples
# In office since 2014-09-29
# 2009-08-20 to 2014-09-29
# 07/08/1986 to 07/08/1992

presidents = {}
fi=open("links.txt",'r')
for line in fi:    
    sline=line.split('"')
    link=sline[0]
    response = requests.get(link)
    country = sline[0].split("/")[-2]
    if (Verbose): print ("Found country "+country)
    presidents[country]=[]   
    ini=response.text.find("list_table")+1
    end=ini+response.text[response.text.find("list_table")+1:].find("/table")
    subtext=response.text[ini:end]
    ini=subtext.find("<td>")
    while (ini>0):
        try:
            subtext=subtext[ini+1:]
            name = presiSearch.search(subtext).group(2)
            href= hrefSearch.search(subtext).group(2)
            if (Verbose): print ("Pres "+country+" "+name)
            presidents[country].append({"name": name, "href": href})
            ini=subtext.find("<td>")
        except:
            ini=subtext.find("<td>")
            print ("Error?")
            print (subtext)

            
            
for country in presidents:
    for president in presidents[country]:        
        if (Verbose): print ("Expanding "+president["name"]+" from "+country)
        response = requests.get(president["href"])
        president["ShortName"] = nameSearch.search(response.text).group(2)
        ini=response.text.find("Terms:")
        end=ini+response.text[ini:].find("</p>")
        subtext=response.text[ini:end]
        president["terms"]=[]
        ini = subtext.find("<b>")
        if (ini<0): 
            ini = subtext.find("/span>")
        while (ini>0):
            try:                
                subtext = subtext[ini+1:]
                term = termSearch.search(subtext).group(2)
                president["terms"].append(term)
                ini=subtext.find("<b>")
            except:
                print ("Error pres?")
                print (subtext)
                ini=subtext.find("<b>")
        if (len(president["terms"])==0):
            print ("Problems")
            print (subtext)
            print (response)
        if (Verbose): print ("Found "+str(len(president["terms"]))+" terms")

fo=open("presidentsRaw.json",'w')
fo.write(json.dumps(presidents))
           
# CLEAN UP 
if (Verbose): print ("CLEAN UP!")
from datetime import datetime
patterns = []
# yyyy-mm-dd
patterns.append( {"reg": re.compile( r'(\d\d\d\d-\d\d-\d\d)( to )(\d\d\d\d-\d\d-\d\d)(.*)',re.DOTALL), "places": [1,3], "pattern": ["%Y-%m-%d", "%Y-%m-%d"]}) 
# mm-dd-yyyy
patterns.append(  {"reg":  re.compile( r'(\d\d\/\d\d\/\d\d\d\d)( to )(\d\d\/\d\d\/\d\d\d\d)(.*)',re.DOTALL) , "places": [1,3], "pattern": ["%m/%d/%Y","%m/%d/%Y"]}) 
# In office since yyyy-mm-dd
patterns.append( {"reg": re.compile( r'(In office since )(\d\d\d\d\-\d\d-\d\d)(.*)',re.DOTALL) , "places": [2,None] , "pattern": ["%Y-%m-%d", None]}) 
# 17th President of South Korea from 02/25/2008
patterns.append( {"reg": re.compile( r'(from )(\d\d\/\d\d\/\d\d\d\d)(.*)',re.DOTALL) , "places": [2,None] , "pattern": ["%m/%d/%Y",None]}) 
# d[d] Month yyyy  d[d] Month yyyy , careful there are commas herelike February 16, 1959  February 24, 2008[
#patterns.append( {"reg": re.compile( r'(\d+)(.[^\d]*)(\d\d\d\d)(.[^\d]*)(\d+)(.[^\d]*)(\d\d\d\d)(.*)',re.DOTALL) , "places": [1,3] , "pattern": ["%d %B %y","%d %B %y"]}) 
# Strange dates: (clean by hand will be suggested in printout)
# Assumed office 24 February 2008
# Acting: 31 July 2006  24 February 2008
# 26 July 1984 to 8 August 1989
# In office since 7th May 2008
# 7 April  26 April 193

def validate():
    for country in presidents:
        for president in presidents[country]: 
            for term in president["terms"]:
                found=False
                for pattern in patterns:
                    found = found or (pattern["reg"].search(term)!=None)
                if (not found):
                    print (term)
                    
def clean():
    print ("CLEAN BY HAND:")    
    for country in presidents:
        for president in presidents[country]: 
            president["cleanterms"]=[]
            for term in president["terms"]:
                try:
                    cleanTerms=[]
                    for pattern in patterns:
                        reg=pattern["reg"].search(term)
                        if (reg!=None):
                            for x in [0,1]:
                                pini=pattern["places"][x]
                                if (pini!=None):
                                    cleanTerms.append(datetime.strptime(reg.group(pini),pattern["pattern"][x]))
                                else:
                                    cleanTerms.append(None)
                            break
                    if (len(cleanTerms)>0):
                        ini=cleanTerms[0].date().isoformat()
                        if (cleanTerms[1]!=None):
                            end=cleanTerms[1].date().isoformat()
                        else:
                            end=None
                        president["cleanterms"].append([ini,end])
                    else:
                        president["cleanterms"].append(["CLEAN","CLEAN"])
                        print ("*"+president["name"]+" from "+country+" term: "+term+reg.groups())
                except:
                    president["cleanterms"].append(["CLEAN","CLEAN"])
                    print ("*"+president["name"]+" from "+country+" term: "+term)

                    
fo=open("presidentsBeforeManualCleanup.json",'w')
fo.write(json.dumps(presidents))
fo.close()