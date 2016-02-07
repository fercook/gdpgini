import json
from datetime import date

# First read up the json
fi=open("presidents_full.json",'r')
presidents=json.loads(fi.read())
fi.close()

# Create a CSV
fo=open("presidents.csv",'w')
fo.write("Country, Name, Start, End, Full Name, Web reference\n");
for country in presidents:
    for president in presidents[country]:
        for term in president["terms"]:
            if (term[1]==None):
                end="Acting"
            else:
                end=term[1]
            fo.write(country+", "+president["name"]+", "+term[0]+","+end+", "+president["titleName"]+", "+president["href"]+"\n")

fo.close()

# Now for sport we will just creae the file like I want it for the Cairo chart
def computeyear(adate):
    if (adate==None):
        return 2020
    year=int(adate[0:4])
    month=int(adate[5:7])
    day=int(adate[8:10])
    yearLength = (date(year+1,1,1)-date(year,1,1)).total_seconds()
    length = (date(year,month,day)-date(year,1,1)).total_seconds()
    return round(year+(length/yearLength),2)

myformat = {}
for country in presidents:
    myformat[country]={}
    myformat[country]["presidents"]=[]
    for president in presidents[country]:
        for term in president["terms"]:
            presi={"name": president["name"]}
            presi["period"]=[computeyear(term[0]),computeyear(term[1])]
            myformat[country]["presidents"].append(presi)


fo=open("presidents_short.json",'w')
fo.write(json.dumps(myformat))
fo.close()
