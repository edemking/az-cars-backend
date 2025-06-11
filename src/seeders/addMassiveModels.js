const fs = require('fs');
const path = require('path');

// Read existing data
const existingModels = require('./data/models.json');
const makes = require('./data/makes.json');

console.log(`Starting with ${existingModels.length} models and ${makes.length} makes`);

// Create a huge array of additional models for many more brands
const massiveModelExpansion = [
  // More Daihatsu models
  { name: "Tanto", make: "Daihatsu", startYear: 2003 },
  { name: "Hijet", make: "Daihatsu", startYear: 1960 },
  { name: "Midget", make: "Daihatsu", startYear: 1957 },
  { name: "Applause", make: "Daihatsu", startYear: 1989 },
  { name: "Cuore", make: "Daihatsu", startYear: 1980 },
  { name: "Feroza", make: "Daihatsu", startYear: 1988 },
  { name: "Gran Move", make: "Daihatsu", startYear: 1996 },
  { name: "Materia", move: "Daihatsu", startYear: 2006 },
  { name: "Max", make: "Daihatsu", startYear: 2001 },
  { name: "Storia", make: "Daihatsu", startYear: 1998 },

  // Chery models
  { name: "QQ", make: "Chery", startYear: 2003 },
  { name: "Tiggo", make: "Chery", startYear: 2005 },
  { name: "A3", make: "Chery", startYear: 2008 },
  { name: "A5", make: "Chery", startYear: 2010 },
  { name: "Arrizo", make: "Chery", startYear: 2013 },
  { name: "eQ", make: "Chery", startYear: 2014 },
  { name: "Exeed", make: "Chery", startYear: 2018 },
  { name: "Tiggo 8", make: "Chery", startYear: 2018 },

  // Great Wall models
  { name: "Wingle", make: "Great Wall", startYear: 2006 },
  { name: "Hover", make: "Great Wall", startYear: 2005 },
  { name: "Voleex", make: "Great Wall", startYear: 2008 },
  { name: "Florid", make: "Great Wall", startYear: 2008 },
  { name: "Peri", make: "Great Wall", startYear: 2007 },
  { name: "Sailor", make: "Great Wall", startYear: 2002 },
  { name: "Safe", make: "Great Wall", startYear: 2001 },

  // MG models  
  { name: "ZS", make: "MG", startYear: 2017 },
  { name: "HS", make: "MG", startYear: 2018 },
  { name: "6", make: "MG", startYear: 2009 },
  { name: "3", make: "MG", startYear: 2008 },
  { name: "TF", make: "MG", startYear: 2002 },
  { name: "ZT", make: "MG", startYear: 2001 },
  { name: "ZR", make: "MG", startYear: 2001 },
  { name: "F", make: "MG", startYear: 1995 },
  { name: "RV8", make: "MG", startYear: 1992 },
  { name: "Midget", make: "MG", startYear: 1961 },
  { name: "MGB", make: "MG", startYear: 1962 },
  { name: "MGA", make: "MG", startYear: 1955 },

  // Holden models
  { name: "Commodore", make: "Holden", startYear: 1978 },
  { name: "Cruze", make: "Holden", startYear: 2009 },
  { name: "Captiva", make: "Holden", startYear: 2006 },
  { name: "Colorado", make: "Holden", startYear: 2008 },
  { name: "Trax", make: "Holden", startYear: 2013 },
  { name: "Barina", make: "Holden", startYear: 1985 },
  { name: "Astra", make: "Holden", startYear: 1996 },
  { name: "Calais", make: "Holden", startYear: 1984 },
  { name: "Statesman", make: "Holden", startYear: 1971 },
  { name: "Monaro", make: "Holden", startYear: 1968 },
  { name: "Torana", make: "Holden", startYear: 1967 },

  // Daewoo models
  { name: "Matiz", make: "Daewoo", startYear: 1998 },
  { name: "Lanos", make: "Daewoo", startYear: 1997 },
  { name: "Nubira", make: "Daewoo", startYear: 1997 },
  { name: "Leganza", make: "Daewoo", startYear: 1997 },
  { name: "Tacuma", make: "Daewoo", startYear: 2000 },
  { name: "Kalos", make: "Daewoo", startYear: 2002 },
  { name: "Lacetti", make: "Daewoo", startYear: 2002 },
  { name: "Tosca", make: "Daewoo", startYear: 2006 },

  // Spyker models
  { name: "C8", make: "Spyker", startYear: 2000 },
  { name: "C12", make: "Spyker", startYear: 2007 },
  { name: "D8", make: "Spyker", startYear: 2001 },
  { name: "D12", make: "Spyker", startYear: 2006 },

  // Donkervoort models
  { name: "D8", make: "Donkervoort", startYear: 1978 },
  { name: "S8", make: "Donkervoort", startYear: 1999 },
  { name: "GTO", make: "Donkervoort", startYear: 2007 },

  // Rimac models
  { name: "Concept One", make: "Rimac", startYear: 2013 },
  { name: "C_Two", make: "Rimac", startYear: 2018 },
  { name: "Nevera", make: "Rimac", startYear: 2021 },

  // Fisker models
  { name: "Karma", make: "Fisker", startYear: 2011 },
  { name: "Ocean", make: "Fisker", startYear: 2022 },
  { name: "Pear", make: "Fisker", startYear: 2024 },

  // Canoo models
  { name: "LDV", make: "Canoo", startYear: 2021 },
  { name: "MPP", make: "Canoo", startYear: 2022 },
  { name: "Pickup", make: "Canoo", startYear: 2023 },

  // Alpine models
  { name: "A110", make: "Alpine", startYear: 2017 },
  { name: "A310", make: "Alpine", startYear: 1971 },
  { name: "A610", make: "Alpine", startYear: 1991 },

  // DS models
  { name: "3", make: "DS", startYear: 2015 },
  { name: "4", make: "DS", startYear: 2015 },
  { name: "5", make: "DS", startYear: 2011 },
  { name: "7", make: "DS", startYear: 2017 },
  { name: "9", make: "DS", startYear: 2023 },

  // Cupra models
  { name: "Leon", make: "Cupra", startYear: 2018 },
  { name: "Ateca", make: "Cupra", startYear: 2018 },
  { name: "Formentor", make: "Cupra", startYear: 2020 },
  { name: "Born", make: "Cupra", startYear: 2021 },

  // Lynk & Co models
  { name: "01", make: "Lynk & Co", startYear: 2017 },
  { name: "02", make: "Lynk & Co", startYear: 2018 },
  { name: "03", make: "Lynk & Co", startYear: 2018 },
  { name: "05", make: "Lynk & Co", startYear: 2020 },
  { name: "06", make: "Lynk & Co", startYear: 2021 },
  { name: "09", make: "Lynk & Co", startYear: 2022 },

  // GAC models
  { name: "Trumpchi", make: "GAC", startYear: 2010 },
  { name: "GS3", make: "GAC", startYear: 2017 },
  { name: "GS4", make: "GAC", startYear: 2015 },
  { name: "GS5", make: "GAC", startYear: 2009 },
  { name: "GS7", make: "GAC", startYear: 2016 },
  { name: "GS8", make: "GAC", startYear: 2017 },
  { name: "GM8", make: "GAC", startYear: 2017 },

  // BAIC models
  { name: "BJ40", make: "BAIC", startYear: 2013 },
  { name: "X25", make: "BAIC", startYear: 2014 },
  { name: "X35", make: "BAIC", startYear: 2016 },
  { name: "X55", make: "BAIC", startYear: 2017 },
  { name: "EU5", make: "BAIC", startYear: 2018 },
  { name: "EX3", make: "BAIC", startYear: 2019 },

  // Changan models
  { name: "CS15", make: "Changan", startYear: 2015 },
  { name: "CS35", make: "Changan", startYear: 2012 },
  { name: "CS55", make: "Changan", startYear: 2017 },
  { name: "CS75", make: "Changan", startYear: 2014 },
  { name: "CS85", make: "Changan", startYear: 2019 },
  { name: "CS95", make: "Changan", startYear: 2017 },
  { name: "Eado", make: "Changan", startYear: 2012 },
  { name: "Raeton", make: "Changan", startYear: 2013 },

  // FAW models
  { name: "Besturn", make: "FAW", startYear: 2006 },
  { name: "B30", make: "FAW", startYear: 2014 },
  { name: "B50", make: "FAW", startYear: 2009 },
  { name: "B70", make: "FAW", startYear: 2006 },
  { name: "X40", make: "FAW", startYear: 2016 },
  { name: "X80", make: "FAW", startYear: 2014 },

  // Dongfeng models
  { name: "AX3", make: "Dongfeng", startYear: 2014 },
  { name: "AX5", make: "Dongfeng", startYear: 2016 },
  { name: "AX7", make: "Dongfeng", startYear: 2014 },
  { name: "A9", make: "Dongfeng", startYear: 2016 },
  { name: "S30", make: "Dongfeng", startYear: 2012 },

  // SAIC models
  { name: "Roewe", make: "SAIC", startYear: 2006 },
  { name: "350", make: "SAIC", startYear: 2010 },
  { name: "550", make: "SAIC", startYear: 2008 },
  { name: "750", make: "SAIC", startYear: 2006 },
  { name: "950", make: "SAIC", startYear: 2012 },
  { name: "RX5", make: "SAIC", startYear: 2016 },

  // Wuling models
  { name: "Hongguang", make: "Wuling", startYear: 2010 },
  { name: "Rongguang", make: "Wuling", startYear: 2008 },
  { name: "Zhengcheng", make: "Wuling", startYear: 2003 },
  { name: "Sunshine", make: "Wuling", startYear: 2003 },
  { name: "Mini EV", make: "Wuling", startYear: 2020 },

  // JAC models
  { name: "J3", make: "JAC", startYear: 2009 },
  { name: "J5", make: "JAC", startYear: 2011 },
  { name: "J6", make: "JAC", startYear: 2012 },
  { name: "S2", make: "JAC", startYear: 2014 },
  { name: "S3", make: "JAC", startYear: 2014 },
  { name: "S5", make: "JAC", startYear: 2013 },
  { name: "iEV", make: "JAC", startYear: 2015 },

  // Zotye models
  { name: "T600", make: "Zotye", startYear: 2013 },
  { name: "SR7", make: "Zotye", startYear: 2016 },
  { name: "SR9", make: "Zotye", startYear: 2016 },
  { name: "Z300", make: "Zotye", startYear: 2011 },
  { name: "Z500", make: "Zotye", startYear: 2013 },
  { name: "E200", make: "Zotye", startYear: 2017 },

  // Lifan models
  { name: "320", make: "Lifan", startYear: 2008 },
  { name: "520", make: "Lifan", startYear: 2006 },
  { name: "620", make: "Lifan", startYear: 2009 },
  { name: "720", make: "Lifan", startYear: 2014 },
  { name: "X50", make: "Lifan", startYear: 2014 },
  { name: "X60", make: "Lifan", startYear: 2011 },

  // Borgward models
  { name: "BX3", make: "Borgward", startYear: 2018 },
  { name: "BX5", make: "Borgward", startYear: 2016 },
  { name: "BX6", make: "Borgward", startYear: 2017 },
  { name: "BX7", make: "Borgward", startYear: 2016 },

  // Force Motors models
  { name: "Gurkha", make: "Force Motors", startYear: 1997 },
  { name: "Trax", make: "Force Motors", startYear: 1986 },
  { name: "Tempo", make: "Force Motors", startYear: 1986 },
  { name: "Traveller", make: "Force Motors", startYear: 1999 },

  // Bajaj models
  { name: "Qute", make: "Bajaj", startYear: 2012 },
  { name: "RE", make: "Bajaj", startYear: 1999 },
  { name: "Maxima", make: "Bajaj", startYear: 2000 },

  // TVS models
  { name: "King", make: "TVS", startYear: 2000 },
  { name: "Max", make: "TVS", startYear: 2016 },

  // Ashok Leyland models
  { name: "Stile", make: "Ashok Leyland", startYear: 2011 },
  { name: "Dost", make: "Ashok Leyland", startYear: 2011 },
  { name: "Partner", make: "Ashok Leyland", startYear: 2012 },

  // Eicher models
  { name: "Pro", make: "Eicher", startYear: 2009 },
  { name: "Skyline", make: "Eicher", startYear: 2008 },

  // Premier models
  { name: "Padmini", make: "Premier", startYear: 1973 },
  { name: "118NE", make: "Premier", startYear: 1985 },
  { name: "137", make: "Premier", startYear: 1989 },
  { name: "Rio", make: "Premier", startYear: 2008 },

  // Hindustan Motors models
  { name: "Ambassador", make: "Hindustan Motors", startYear: 1958 },
  { name: "Contessa", make: "Hindustan Motors", startYear: 1984 },

  // Great Wall Motors models (separate from Great Wall)
  { name: "Poer", make: "Great Wall Motors", startYear: 2020 },
  { name: "Tank", make: "Great Wall Motors", startYear: 2021 },
  { name: "Ora", make: "Great Wall Motors", startYear: 2018 },

  // Brilliance models
  { name: "FRV", make: "Brilliance", startYear: 2006 },
  { name: "FSV", make: "Brilliance", startYear: 2003 },
  { name: "H230", make: "Brilliance", startYear: 2011 },
  { name: "H320", make: "Brilliance", startYear: 2012 },
  { name: "H330", make: "Brilliance", startYear: 2013 },
  { name: "V3", make: "Brilliance", startYear: 2011 },
  { name: "V5", make: "Brilliance", startYear: 2011 },

  // BYD Auto models (separate from BYD)
  { name: "F0", make: "BYD Auto", startYear: 2008 },
  { name: "F3", make: "BYD Auto", startYear: 2005 },
  { name: "F6", make: "BYD Auto", startYear: 2007 },
  { name: "G3", make: "BYD Auto", startYear: 2009 },
  { name: "G6", make: "BYD Auto", startYear: 2011 },
  { name: "L3", make: "BYD Auto", startYear: 2010 },
  { name: "M6", make: "BYD Auto", startYear: 2009 },
  { name: "S6", make: "BYD Auto", startYear: 2011 },

  // Foton models
  { name: "Auman", make: "Foton", startYear: 2002 },
  { name: "Aumark", make: "Foton", startYear: 2004 },
  { name: "Ollin", make: "Foton", startYear: 2005 },
  { name: "Sauvana", make: "Foton", startYear: 2014 },
  { name: "Tunland", make: "Foton", startYear: 2012 },

  // Hafei models
  { name: "Lobo", make: "Hafei", startYear: 2003 },
  { name: "Sigma", make: "Hafei", startYear: 2006 },
  { name: "Lubao", make: "Hafei", startYear: 2001 },

  // Jinbei models
  { name: "Hiace", make: "Jinbei", startYear: 1991 },
  { name: "Grace", make: "Jinbei", startYear: 2007 },
  { name: "750", make: "Jinbei", startYear: 2014 },

  // King Long models
  { name: "XMQ", make: "King Long", startYear: 1988 },
  { name: "XML", make: "King Long", startYear: 1995 },

  // Yutong models
  { name: "ZK", make: "Yutong", startYear: 1993 },
  { name: "E12", make: "Yutong", startYear: 2017 },

  // Zhonghua models
  { name: "Zunchi", make: "Zhonghua", startYear: 2003 },
  { name: "Junjie", make: "Zhonghua", startYear: 2006 },
  { name: "H220", make: "Zhonghua", startYear: 2009 },
  { name: "H230", make: "Zhonghua", startYear: 2010 },
  { name: "H320", make: "Zhonghua", startYear: 2011 },
  { name: "H330", make: "Zhonghua", startYear: 2012 },
  { name: "V3", make: "Zhonghua", startYear: 2011 },
  { name: "V5", make: "Zhonghua", startYear: 2011 },

  // Kia Motors models (different from Kia)
  { name: "Picanto", make: "Kia Motors", startYear: 2004 },
  { name: "Rio", make: "Kia Motors", startYear: 1999 },
  { name: "Ceed", make: "Kia Motors", startYear: 2006 },
  { name: "Venga", make: "Kia Motors", startYear: 2009 },
  { name: "Carens", make: "Kia Motors", startYear: 1999 },

  // Samsung models (the car division)
  { name: "SM3", make: "Samsung", startYear: 2002 },
  { name: "SM5", make: "Samsung", startYear: 1998 },
  { name: "SM7", make: "Samsung", startYear: 2004 },

  // Daewoo Motors models (different from Daewoo)
  { name: "Espero", make: "Daewoo Motors", startYear: 1990 },
  { name: "Cielo", make: "Daewoo Motors", startYear: 1994 },
  { name: "Nexia", make: "Daewoo Motors", startYear: 1994 },
  { name: "Racer", make: "Daewoo Motors", startYear: 1986 },

  // Packard models
  { name: "Super Eight", make: "Packard", startYear: 1940 },
  { name: "Clipper", make: "Packard", startYear: 1941 },
  { name: "Caribbean", make: "Packard", startYear: 1953 },
  { name: "Patrician", make: "Packard", startYear: 1951 },

  // Hudson models
  { name: "Hornet", make: "Hudson", startYear: 1951 },
  { name: "Wasp", make: "Hudson", startYear: 1952 },
  { name: "Jet", make: "Hudson", startYear: 1953 },
  { name: "Italia", make: "Hudson", startYear: 1954 },

  // Nash models
  { name: "Metropolitan", make: "Nash", startYear: 1953 },
  { name: "Statesman", make: "Nash", startYear: 1950 },
  { name: "Ambassador", make: "Nash", startYear: 1958 },
  { name: "Healey", make: "Nash", startYear: 1951 },

  // Rambler models
  { name: "American", make: "Rambler", startYear: 1958 },
  { name: "Classic", make: "Rambler", startYear: 1961 },
  { name: "Rebel", make: "Rambler", startYear: 1967 },
  { name: "Marlin", make: "Rambler", startYear: 1965 },

  // DeSoto models
  { name: "Adventurer", make: "DeSoto", startYear: 1956 },
  { name: "Fireflite", make: "DeSoto", startYear: 1955 },
  { name: "Firedome", make: "DeSoto", startYear: 1952 },
  { name: "Diplomat", make: "DeSoto", startYear: 1977 },

  // Imperial models
  { name: "Crown", make: "Imperial", startYear: 1957 },
  { name: "LeBaron", make: "Imperial", startYear: 1957 },
  { name: "Southampton", make: "Imperial", startYear: 1957 },

  // Checker models
  { name: "Marathon", make: "Checker", startYear: 1961 },
  { name: "Aerobus", make: "Checker", startYear: 1962 },
  { name: "Superba", make: "Checker", startYear: 1960 },

  // Sterling models
  { name: "825", make: "Sterling", startYear: 1987 },
  { name: "827", make: "Sterling", startYear: 1988 },

  // TVR models
  { name: "Griffith", make: "TVR", startYear: 1963 },
  { name: "Chimaera", make: "TVR", startYear: 1992 },
  { name: "Cerbera", make: "TVR", startYear: 1996 },
  { name: "Tuscan", make: "TVR", startYear: 1999 },
  { name: "Tamora", make: "TVR", startYear: 2002 },
  { name: "T350", make: "TVR", startYear: 2002 },
  { name: "Sagaris", make: "TVR", startYear: 2005 },

  // Bristol models
  { name: "401", make: "Bristol", startYear: 1948 },
  { name: "403", make: "Bristol", startYear: 1953 },
  { name: "405", make: "Bristol", startYear: 1954 },
  { name: "407", make: "Bristol", startYear: 1961 },
  { name: "411", make: "Bristol", startYear: 1969 },
  { name: "Beaufighter", make: "Bristol", startYear: 1977 },
  { name: "Blenheim", make: "Bristol", startYear: 1993 },
  { name: "Fighter", make: "Bristol", startYear: 2004 },

  // Vauxhall models
  { name: "Corsa", make: "Vauxhall", startYear: 1993 },
  { name: "Astra", make: "Vauxhall", startYear: 1980 },
  { name: "Vectra", make: "Vauxhall", startYear: 1988 },
  { name: "Insignia", make: "Vauxhall", startYear: 2008 },
  { name: "Zafira", make: "Vauxhall", startYear: 1999 },
  { name: "Meriva", make: "Vauxhall", startYear: 2003 },
  { name: "Mokka", make: "Vauxhall", startYear: 2012 },
  { name: "Antara", make: "Vauxhall", startYear: 2006 },
  { name: "Frontera", make: "Vauxhall", startYear: 1991 },
  { name: "Monterey", make: "Vauxhall", startYear: 1994 },

  // Reliant models
  { name: "Robin", make: "Reliant", startYear: 1973 },
  { name: "Regal", make: "Reliant", startYear: 1953 },
  { name: "Scimitar", make: "Reliant", startYear: 1964 },
  { name: "Kitten", make: "Reliant", startYear: 1975 },

  // Hillman models
  { name: "Imp", make: "Hillman", startYear: 1963 },
  { name: "Hunter", make: "Hillman", startYear: 1966 },
  { name: "Avenger", make: "Hillman", startYear: 1970 },
  { name: "Minx", make: "Hillman", startYear: 1932 },

  // Sunbeam models
  { name: "Tiger", make: "Sunbeam", startYear: 1964 },
  { name: "Alpine", make: "Sunbeam", startYear: 1959 },
  { name: "Rapier", make: "Sunbeam", startYear: 1955 },
  { name: "Stiletto", make: "Sunbeam", startYear: 1967 },

  // Talbot models
  { name: "Horizon", make: "Talbot", startYear: 1978 },
  { name: "Solara", make: "Talbot", startYear: 1980 },
  { name: "Samba", make: "Talbot", startYear: 1981 },
  { name: "Tagora", make: "Talbot", startYear: 1981 },

  // Jensen models
  { name: "Interceptor", make: "Jensen", startYear: 1966 },
  { name: "FF", make: "Jensen", startYear: 1966 },
  { name: "Healey", make: "Jensen", startYear: 1972 },
  { name: "S-V8", make: "Jensen", startYear: 1998 },

  // AC Cars models
  { name: "Cobra", make: "AC Cars", startYear: 1962 },
  { name: "Ace", make: "AC Cars", startYear: 1953 },
  { name: "Aceca", make: "AC Cars", startYear: 1954 },
  { name: "428", make: "AC Cars", startYear: 1965 },
  { name: "3000ME", make: "AC Cars", startYear: 1973 },

  // Ginetta models
  { name: "G4", make: "Ginetta", startYear: 1961 },
  { name: "G15", make: "Ginetta", startYear: 1967 },
  { name: "G27", make: "Ginetta", startYear: 1985 },
  { name: "G33", make: "Ginetta", startYear: 1989 },
  { name: "G40", make: "Ginetta", startYear: 2010 },

  // Westfield models
  { name: "SEi", make: "Westfield", startYear: 1982 },
  { name: "XI", make: "Westfield", startYear: 1996 },
  { name: "XTR2", make: "Westfield", startYear: 2006 },

  // Ariel models
  { name: "Atom", make: "Ariel", startYear: 1999 },
  { name: "Nomad", make: "Ariel", startYear: 2014 },

  // Radical models
  { name: "SR3", make: "Radical", startYear: 2001 },
  { name: "SR8", make: "Radical", startYear: 2006 },
  { name: "RXC", make: "Radical", startYear: 2013 },

  // Caparo models
  { name: "T1", make: "Caparo", startYear: 2007 },

  // BAC models
  { name: "Mono", make: "BAC", startYear: 2011 },

  // David Brown models
  { name: "Speedback", make: "David Brown", startYear: 2014 },
  { name: "Mini Remastered", make: "David Brown", startYear: 2018 },

  // Elemental models
  { name: "RP1", make: "Elemental", startYear: 2014 },

  // Lister models
  { name: "Storm", make: "Lister", startYear: 1993 },
  { name: "Knobbly", make: "Lister", startYear: 1957 },

  // Ultima models
  { name: "GTR", make: "Ultima", startYear: 1999 },
  { name: "Evolution", make: "Ultima", startYear: 2015 },
  { name: "RS", make: "Ultima", startYear: 2020 },

  // De Tomaso models
  { name: "Pantera", make: "De Tomaso", startYear: 1971 },
  { name: "Mangusta", make: "De Tomaso", startYear: 1967 },
  { name: "Vallelunga", make: "De Tomaso", startYear: 1963 },
  { name: "Longchamp", make: "De Tomaso", startYear: 1972 },
  { name: "Deauville", make: "De Tomaso", startYear: 1971 },

  // Iso models
  { name: "Grifo", make: "Iso", startYear: 1963 },
  { name: "Rivolta", make: "Iso", startYear: 1962 },
  { name: "Lele", make: "Iso", startYear: 1969 },
  { name: "Fidia", make: "Iso", startYear: 1967 },

  // Bizzarrini models
  { name: "5300 GT", make: "Bizzarrini", startYear: 1964 },
  { name: "1900 GT", make: "Bizzarrini", startYear: 1965 },
  { name: "P538", make: "Bizzarrini", startYear: 1966 },

  // Cisitalia models
  { name: "202", make: "Cisitalia", startYear: 1947 },
  { name: "D46", make: "Cisitalia", startYear: 1946 },

  // Innocenti models
  { name: "Mini", make: "Innocenti", startYear: 1974 },
  { name: "Regent", make: "Innocenti", startYear: 1974 },

  // Autobianchi models
  { name: "A112", make: "Autobianchi", startYear: 1969 },
  { name: "Primula", make: "Autobianchi", startYear: 1964 },
  { name: "Y10", make: "Autobianchi", startYear: 1985 },

  // Abarth models
  { name: "595", make: "Abarth", startYear: 2008 },
  { name: "695", make: "Abarth", startYear: 2008 },
  { name: "124 Spider", make: "Abarth", startYear: 2016 },
  { name: "Punto", make: "Abarth", startYear: 2009 },

  // Pininfarina models
  { name: "Battista", make: "Pininfarina", startYear: 2019 },
  { name: "B95", make: "Pininfarina", startYear: 2022 },

  // Simca models
  { name: "1000", make: "Simca", startYear: 1961 },
  { name: "1100", make: "Simca", startYear: 1967 },
  { name: "1200S", make: "Simca", startYear: 1967 },
  { name: "1301", make: "Simca", startYear: 1963 },
  { name: "1501", make: "Simca", startYear: 1963 },

  // Panhard models
  { name: "Dyna", make: "Panhard", startYear: 1946 },
  { name: "PL17", make: "Panhard", startYear: 1959 },
  { name: "24", make: "Panhard", startYear: 1963 },

  // Facel Vega models
  { name: "FV", make: "Facel Vega", startYear: 1954 },
  { name: "HK500", make: "Facel Vega", startYear: 1958 },
  { name: "Excellence", make: "Facel Vega", startYear: 1958 },
  { name: "Facel II", make: "Facel Vega", startYear: 1962 },
  { name: "Facellia", make: "Facel Vega", startYear: 1959 },

  // Ligier models
  { name: "JS2", make: "Ligier", startYear: 1971 },
  { name: "JS4", make: "Ligier", startYear: 1976 },
  { name: "JS8", make: "Ligier", startYear: 1978 },

  // Aixam models
  { name: "A721", make: "Aixam", startYear: 1983 },
  { name: "A741", make: "Aixam", startYear: 1999 },
  { name: "City", make: "Aixam", startYear: 2008 },

  // Microcar models
  { name: "MC1", make: "Microcar", startYear: 1984 },
  { name: "MC2", make: "Microcar", startYear: 1999 },
  { name: "M.Go", make: "Microcar", startYear: 2008 },

  // Venturi models
  { name: "Atlantique", make: "Venturi", startYear: 1991 },
  { name: "300", make: "Venturi", startYear: 1984 },
  { name: "400", make: "Venturi", startYear: 1992 },
  { name: "Fetish", make: "Venturi", startYear: 2007 },

  // Vencer models
  { name: "Sarthe", make: "Vencer", startYear: 2012 },

  // Gumpert models
  { name: "Apollo", make: "Gumpert", startYear: 2005 },
  { name: "Explosion", make: "Gumpert", startYear: 2009 },

  // Wiesmann models
  { name: "GT", make: "Wiesmann", startYear: 1993 },
  { name: "Roadster", make: "Wiesmann", startYear: 1993 },
  { name: "Spyder", make: "Wiesmann", startYear: 2005 },

  // Artega models
  { name: "GT", make: "Artega", startYear: 2009 },
  { name: "SE", make: "Artega", startYear: 2011 },

  // Maybach models (standalone)
  { name: "57", make: "Maybach", startYear: 2002 },
  { name: "62", make: "Maybach", startYear: 2002 },
  { name: "Exelero", make: "Maybach", startYear: 2005 },

  // Lancia models
  { name: "Delta", make: "Lancia", startYear: 1979 },
  { name: "Ypsilon", make: "Lancia", startYear: 2003 },
  { name: "Musa", make: "Lancia", startYear: 2004 },
  { name: "Thesis", make: "Lancia", startYear: 2001 },
  { name: "Phedra", make: "Lancia", startYear: 2002 },
  { name: "Stratos", make: "Lancia", startYear: 1973 },
  { name: "037", make: "Lancia", startYear: 1982 },

  // And many more manufacturers with basic models...
  { name: "Commander", make: "Jeep", startYear: 2005 },
  { name: "Liberty", make: "Jeep", startYear: 2001 },
  { name: "Patriot", make: "Jeep", startYear: 2007 }
];

// Combine existing models with massive expansion
const allModels = [...existingModels, ...massiveModelExpansion];

// Filter out any duplicates based on name and make combination
const uniqueModels = allModels.filter((model, index, self) => 
  index === self.findIndex((m) => m.name === model.name && m.make === model.make)
);

// Write the massively expanded models file
fs.writeFileSync(
  path.join(__dirname, 'data', 'models.json'),
  JSON.stringify(uniqueModels, null, 2)
);

console.log(`Added ${massiveModelExpansion.length} new models`);
console.log(`Total models after deduplication: ${uniqueModels.length}`);
console.log('Massive models dataset created successfully!'); 