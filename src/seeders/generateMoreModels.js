const fs = require('fs');
const path = require('path');

// Read existing data
const existingModels = require('./data/models.json');
const makes = require('./data/makes.json');

// Additional models for major manufacturers
const additionalModels = [
  // Toyota expansion
  { name: "Land Cruiser", make: "Toyota", startYear: 1951 },
  { name: "Sequoia", make: "Toyota", startYear: 2000 },
  { name: "Sienna", make: "Toyota", startYear: 1997 },
  { name: "Avalon", make: "Toyota", startYear: 1994 },
  { name: "Yaris", make: "Toyota", startYear: 1999 },
  { name: "C-HR", make: "Toyota", startYear: 2016 },
  { name: "Venza", make: "Toyota", startYear: 2008 },
  { name: "Matrix", make: "Toyota", startYear: 2002 },
  { name: "Celica", make: "Toyota", startYear: 1970 },
  { name: "Supra", make: "Toyota", startYear: 1978 },
  { name: "MR2", make: "Toyota", startYear: 1984 },
  { name: "Tercel", make: "Toyota", startYear: 1978 },
  { name: "Echo", make: "Toyota", startYear: 1999 },
  { name: "Previa", make: "Toyota", startYear: 1990 },
  { name: "T100", make: "Toyota", startYear: 1993 },
  { name: "FJ Cruiser", make: "Toyota", startYear: 2006 },
  { name: "Solara", make: "Toyota", startYear: 1998 },

  // Honda expansion  
  { name: "Element", make: "Honda", startYear: 2003 },
  { name: "Fit", make: "Honda", startYear: 2001 },
  { name: "Insight", make: "Honda", startYear: 1999 },
  { name: "S2000", make: "Honda", startYear: 1999 },
  { name: "Prelude", make: "Honda", startYear: 1978 },
  { name: "CRX", make: "Honda", startYear: 1983 },
  { name: "del Sol", make: "Honda", startYear: 1992 },
  { name: "Crosstour", make: "Honda", startYear: 2009 },
  { name: "Ridgeline", make: "Honda", startYear: 2005 },
  { name: "Clarity", make: "Honda", startYear: 2017 },

  // Ford expansion
  { name: "Bronco", make: "Ford", startYear: 1966 },
  { name: "Ranger", make: "Ford", startYear: 1983 },
  { name: "Fiesta", make: "Ford", startYear: 1976 },
  { name: "Taurus", make: "Ford", startYear: 1985 },
  { name: "Crown Victoria", make: "Ford", startYear: 1991 },
  { name: "Thunderbird", make: "Ford", startYear: 1955 },
  { name: "Contour", make: "Ford", startYear: 1994 },
  { name: "Tempo", make: "Ford", startYear: 1984 },
  { name: "Windstar", make: "Ford", startYear: 1994 },
  { name: "Freestar", make: "Ford", startYear: 2004 },
  { name: "Flex", make: "Ford", startYear: 2008 },
  { name: "Five Hundred", make: "Ford", startYear: 2004 },
  { name: "Freestyle", make: "Ford", startYear: 2004 },
  { name: "GT", make: "Ford", startYear: 2004 },
  { name: "Bronco Sport", make: "Ford", startYear: 2020 },
  { name: "Maverick", make: "Ford", startYear: 2021 },
  { name: "Lightning", make: "Ford", startYear: 2022 },

  // Chevrolet expansion
  { name: "Impala", make: "Chevrolet", startYear: 1958 },
  { name: "Cruze", make: "Chevrolet", startYear: 2008 },
  { name: "Sonic", make: "Chevrolet", startYear: 2011 },
  { name: "Spark", make: "Chevrolet", startYear: 2012 },
  { name: "Volt", make: "Chevrolet", startYear: 2010 },
  { name: "Bolt", make: "Chevrolet", startYear: 2016 },
  { name: "Trax", make: "Chevrolet", startYear: 2012 },
  { name: "Blazer", make: "Chevrolet", startYear: 1969 },
  { name: "Colorado", make: "Chevrolet", startYear: 2004 },
  { name: "S-10", make: "Chevrolet", startYear: 1981 },
  { name: "Astro", make: "Chevrolet", startYear: 1985 },
  { name: "Express", make: "Chevrolet", startYear: 1995 },
  { name: "Avalanche", make: "Chevrolet", startYear: 2001 },
  { name: "SSR", make: "Chevrolet", startYear: 2003 },
  { name: "HHR", make: "Chevrolet", startYear: 2005 },
  { name: "Cobalt", make: "Chevrolet", startYear: 2004 },
  { name: "Aveo", make: "Chevrolet", startYear: 2003 },

  // BMW expansion
  { name: "1 Series", make: "BMW", startYear: 2004 },
  { name: "2 Series", make: "BMW", startYear: 2013 },
  { name: "4 Series", make: "BMW", startYear: 2013 },
  { name: "6 Series", make: "BMW", startYear: 1976 },
  { name: "8 Series", make: "BMW", startYear: 1989 },
  { name: "X2", make: "BMW", startYear: 2017 },
  { name: "X4", make: "BMW", startYear: 2014 },
  { name: "X6", make: "BMW", startYear: 2008 },
  { name: "i3", make: "BMW", startYear: 2013 },
  { name: "i4", make: "BMW", startYear: 2021 },
  { name: "i8", make: "BMW", startYear: 2014 },
  { name: "iX", make: "BMW", startYear: 2021 },
  { name: "M2", make: "BMW", startYear: 2015 },
  { name: "M3", make: "BMW", startYear: 1986 },
  { name: "M4", make: "BMW", startYear: 2014 },
  { name: "M5", make: "BMW", startYear: 1984 },
  { name: "M6", make: "BMW", startYear: 2005 },
  { name: "M8", make: "BMW", startYear: 2019 },

  // Mercedes-Benz expansion
  { name: "B-Class", make: "Mercedes-Benz", startYear: 2005 },
  { name: "CLA", make: "Mercedes-Benz", startYear: 2013 },
  { name: "CLS", make: "Mercedes-Benz", startYear: 2004 },
  { name: "GLB", make: "Mercedes-Benz", startYear: 2019 },
  { name: "GLS", make: "Mercedes-Benz", startYear: 2006 },
  { name: "SL", make: "Mercedes-Benz", startYear: 1954 },
  { name: "SLC", make: "Mercedes-Benz", startYear: 2016 },
  { name: "SLK", make: "Mercedes-Benz", startYear: 1996 },
  { name: "AMG GT", make: "Mercedes-Benz", startYear: 2014 },
  { name: "Metris", make: "Mercedes-Benz", startYear: 2015 },
  { name: "Sprinter", make: "Mercedes-Benz", startYear: 1995 },
  { name: "EQS", make: "Mercedes-Benz", startYear: 2021 },
  { name: "EQC", make: "Mercedes-Benz", startYear: 2019 },
  { name: "EQE", make: "Mercedes-Benz", startYear: 2022 },

  // Audi expansion
  { name: "A1", make: "Audi", startYear: 2010 },
  { name: "A2", make: "Audi", startYear: 1999 },
  { name: "A5", make: "Audi", startYear: 2007 },
  { name: "A7", make: "Audi", startYear: 2010 },
  { name: "Q2", make: "Audi", startYear: 2016 },
  { name: "Q4", make: "Audi", startYear: 2021 },
  { name: "Q6", make: "Audi", startYear: 2022 },
  { name: "Q8", make: "Audi", startYear: 2018 },
  { name: "R8", make: "Audi", startYear: 2006 },
  { name: "RS3", make: "Audi", startYear: 2011 },
  { name: "RS4", make: "Audi", startYear: 1999 },
  { name: "RS5", make: "Audi", startYear: 2010 },
  { name: "RS6", make: "Audi", startYear: 2002 },
  { name: "RS7", make: "Audi", startYear: 2013 },
  { name: "e-tron", make: "Audi", startYear: 2018 },
  { name: "e-tron GT", make: "Audi", startYear: 2021 },

  // Volkswagen expansion
  { name: "Touareg", make: "Volkswagen", startYear: 2002 },
  { name: "Touran", make: "Volkswagen", startYear: 2003 },
  { name: "Sharan", make: "Volkswagen", startYear: 1995 },
  { name: "Polo", make: "Volkswagen", startYear: 1975 },
  { name: "Up!", make: "Volkswagen", startYear: 2011 },
  { name: "Arteon", make: "Volkswagen", startYear: 2017 },
  { name: "CC", make: "Volkswagen", startYear: 2008 },
  { name: "Eos", make: "Volkswagen", startYear: 2006 },
  { name: "Phaeton", make: "Volkswagen", startYear: 2002 },
  { name: "Routan", make: "Volkswagen", startYear: 2008 },
  { name: "ID.3", make: "Volkswagen", startYear: 2019 },
  { name: "ID.4", make: "Volkswagen", startYear: 2020 },
  { name: "e-Golf", make: "Volkswagen", startYear: 2014 },

  // Nissan expansion
  { name: "Versa", make: "Nissan", startYear: 2006 },
  { name: "Kicks", make: "Nissan", startYear: 2016 },
  { name: "Armada", make: "Nissan", startYear: 2003 },
  { name: "Quest", make: "Nissan", startYear: 1992 },
  { name: "Xterra", make: "Nissan", startYear: 1999 },
  { name: "Juke", make: "Nissan", startYear: 2010 },
  { name: "Cube", make: "Nissan", startYear: 1998 },
  { name: "Leaf", make: "Nissan", startYear: 2010 },
  { name: "370Z", make: "Nissan", startYear: 2008 },
  { name: "350Z", make: "Nissan", startYear: 2002 },
  { name: "GT-R", make: "Nissan", startYear: 2007 },
  { name: "NV200", make: "Nissan", startYear: 2009 },
  { name: "Ariya", make: "Nissan", startYear: 2021 },

  // Mazda expansion
  { name: "CX-30", make: "Mazda", startYear: 2019 },
  { name: "CX-50", make: "Mazda", startYear: 2022 },
  { name: "RX-7", make: "Mazda", startYear: 1978 },
  { name: "RX-8", make: "Mazda", startYear: 2003 },
  { name: "B-Series", make: "Mazda", startYear: 1972 },
  { name: "Tribute", make: "Mazda", startYear: 2000 },
  { name: "MPV", make: "Mazda", startYear: 1988 },
  { name: "Protégé", make: "Mazda", startYear: 1989 },
  { name: "626", make: "Mazda", startYear: 1979 },
  { name: "929", make: "Mazda", startYear: 1987 },
  { name: "Millenia", make: "Mazda", startYear: 1993 },
  { name: "323", make: "Mazda", startYear: 1977 },

  // Subaru expansion
  { name: "WRX", make: "Subaru", startYear: 1992 },
  { name: "BRZ", make: "Subaru", startYear: 2012 },
  { name: "Tribeca", make: "Subaru", startYear: 2005 },
  { name: "Baja", make: "Subaru", startYear: 2002 },
  { name: "SVX", make: "Subaru", startYear: 1991 },
  { name: "Justy", make: "Subaru", startYear: 1987 },
  { name: "Loyale", make: "Subaru", startYear: 1989 },
  { name: "XT", make: "Subaru", startYear: 1985 },

  // Electric and New Brands
  { name: "Chiron", make: "Bugatti", startYear: 2016 },
  { name: "Veyron", make: "Bugatti", startYear: 2005 },
  { name: "Divo", make: "Bugatti", startYear: 2018 },
  
  { name: "Regera", make: "Koenigsegg", startYear: 2016 },
  { name: "Jesko", make: "Koenigsegg", startYear: 2019 },
  { name: "Agera", make: "Koenigsegg", startYear: 2011 },
  { name: "Gemera", make: "Koenigsegg", startYear: 2022 },

  { name: "Huayra", make: "Pagani", startYear: 2011 },
  { name: "Zonda", make: "Pagani", startYear: 1999 },
  { name: "Utopia", make: "Pagani", startYear: 2022 },

  { name: "Elise", make: "Lotus", startYear: 1996 },
  { name: "Exige", make: "Lotus", startYear: 2000 },
  { name: "Evora", make: "Lotus", startYear: 2009 },
  { name: "Emira", make: "Lotus", startYear: 2021 },
  { name: "Eletre", make: "Lotus", startYear: 2022 },

  // Chinese brands
  { name: "Tang", make: "BYD", startYear: 2018 },
  { name: "Han", make: "BYD", startYear: 2020 },
  { name: "Qin", make: "BYD", startYear: 2013 },
  { name: "Song", make: "BYD", startYear: 2016 },
  { name: "Yuan", make: "BYD", startYear: 2016 },
  { name: "Atto 3", make: "BYD", startYear: 2022 },
  { name: "Seal", make: "BYD", startYear: 2022 },

  { name: "Atlas", make: "Geely", startYear: 2016 },
  { name: "Emgrand", make: "Geely", startYear: 2009 },
  { name: "Vision", make: "Geely", startYear: 2006 },
  { name: "Coolray", make: "Geely", startYear: 2018 },
  { name: "Xingyue", make: "Geely", startYear: 2019 },

  { name: "H6", make: "Haval", startYear: 2011 },
  { name: "H9", make: "Haval", startYear: 2014 },
  { name: "F7", make: "Haval", startYear: 2018 },
  { name: "Jolion", make: "Haval", startYear: 2020 },

  { name: "ET7", make: "NIO", startYear: 2021 },
  { name: "ET5", make: "NIO", startYear: 2022 },
  { name: "ES8", make: "NIO", startYear: 2018 },
  { name: "ES6", make: "NIO", startYear: 2019 },
  { name: "EC6", make: "NIO", startYear: 2020 },

  { name: "P7", make: "Xpeng", startYear: 2020 },
  { name: "P5", make: "Xpeng", startYear: 2021 },
  { name: "G3", make: "Xpeng", startYear: 2018 },
  { name: "G9", make: "Xpeng", startYear: 2022 },

  { name: "Li ONE", make: "Li Auto", startYear: 2019 },
  { name: "Li L9", make: "Li Auto", startYear: 2022 },
  { name: "Li L8", make: "Li Auto", startYear: 2022 },
  { name: "Li L7", make: "Li Auto", startYear: 2023 },

  // Historic US brands
  { name: "Barracuda", make: "Plymouth", startYear: 1964 },
  { name: "Road Runner", make: "Plymouth", startYear: 1968 },
  { name: "Duster", make: "Plymouth", startYear: 1970 },
  { name: "Fury", make: "Plymouth", startYear: 1956 },
  { name: "Valiant", make: "Plymouth", startYear: 1960 },

  { name: "Firebird", make: "Pontiac", startYear: 1967 },
  { name: "GTO", make: "Pontiac", startYear: 1964 },
  { name: "Trans Am", make: "Pontiac", startYear: 1969 },
  { name: "Grand Prix", make: "Pontiac", startYear: 1962 },
  { name: "Bonneville", make: "Pontiac", startYear: 1957 },

  { name: "Grand Marquis", make: "Mercury", startYear: 1975 },
  { name: "Cougar", make: "Mercury", startYear: 1967 },
  { name: "Sable", make: "Mercury", startYear: 1985 },
  { name: "Mountaineer", make: "Mercury", startYear: 1996 },

  // British classics
  { name: "Spitfire", make: "Triumph", startYear: 1962 },
  { name: "TR6", make: "Triumph", startYear: 1968 },
  { name: "Stag", make: "Triumph", startYear: 1970 },
  { name: "Herald", make: "Triumph", startYear: 1959 },

  { name: "Mini Classic", make: "Austin", startYear: 1959 },
  { name: "Healey", make: "Austin", startYear: 1952 },
  { name: "A35", make: "Austin", startYear: 1956 },

  { name: "Minor", make: "Morris", startYear: 1948 },
  { name: "Oxford", make: "Morris", startYear: 1913 },
  { name: "Marina", make: "Morris", startYear: 1971 },

  { name: "P5", make: "Rover", startYear: 1958 },
  { name: "SD1", make: "Rover", startYear: 1976 },
  { name: "25", make: "Rover", startYear: 1999 },
  { name: "45", make: "Rover", startYear: 1999 },
  { name: "75", make: "Rover", startYear: 1999 },

  { name: "Plus 4", make: "Morgan", startYear: 1950 },
  { name: "Plus 8", make: "Morgan", startYear: 1968 },
  { name: "Aero 8", make: "Morgan", startYear: 2001 },
  { name: "3 Wheeler", make: "Morgan", startYear: 2011 },

  { name: "Seven", make: "Caterham", startYear: 1973 },
  { name: "21", make: "Caterham", startYear: 1994 },

  { name: "M12", make: "Noble", startYear: 2000 },
  { name: "M400", make: "Noble", startYear: 2004 },
  { name: "M600", make: "Noble", startYear: 2009 },

  // Daihatsu models
  { name: "Copen", make: "Daihatsu", startYear: 2002 },
  { name: "Terios", make: "Daihatsu", startYear: 1997 },
  { name: "Sirion", make: "Daihatsu", startYear: 1998 },
  { name: "Charade", make: "Daihatsu", startYear: 1977 },
  { name: "Move", make: "Daihatsu", startYear: 1995 },
  { name: "Mira", make: "Daihatsu", startYear: 1980 },
  { name: "Rocky", make: "Daihatsu", startYear: 1989 },

  // More German tuners
  { name: "Yellowbird", make: "RUF", startYear: 1987 },
  { name: "CTR", make: "RUF", startYear: 1987 },
  { name: "RT12", make: "RUF", startYear: 2005 },

  { name: "B7", make: "Alpina", startYear: 2005 },
  { name: "D3", make: "Alpina", startYear: 2003 },
  { name: "XD3", make: "Alpina", startYear: 2013 },

  // More historic models for completeness
  { name: "Niva", make: "Lada", startYear: 1977 },
  { name: "Riva", make: "Lada", startYear: 1980 },
  { name: "Samara", make: "Lada", startYear: 1984 },
  { name: "110", make: "Lada", startYear: 1995 },
  { name: "Priora", make: "Lada", startYear: 2007 },
  { name: "Granta", make: "Lada", startYear: 2011 },
  { name: "Vesta", make: "Lada", startYear: 2015 },
  { name: "XRAY", make: "Lada", startYear: 2015 }
];

// Generate models for many other brands that don't have models yet
const additionalBrandModels = [
  // Scion models
  { name: "tC", make: "Scion", startYear: 2004 },
  { name: "xB", make: "Scion", startYear: 2003 },
  { name: "xA", make: "Scion", startYear: 2003 },
  { name: "xD", make: "Scion", startYear: 2007 },
  { name: "iQ", make: "Scion", startYear: 2011 },
  { name: "FR-S", make: "Scion", startYear: 2012 },
  { name: "iM", make: "Scion", startYear: 2015 },
  { name: "iA", make: "Scion", startYear: 2015 },

  // Datsun models
  { name: "240Z", make: "Datsun", startYear: 1969 },
  { name: "280Z", make: "Datsun", startYear: 1975 },
  { name: "510", make: "Datsun", startYear: 1968 },
  { name: "620", make: "Datsun", startYear: 1972 },
  { name: "720", make: "Datsun", startYear: 1979 },
  { name: "B210", make: "Datsun", startYear: 1973 },
  { name: "F10", make: "Datsun", startYear: 1976 },
  { name: "200SX", make: "Datsun", startYear: 1977 },

  // AMC models
  { name: "Gremlin", make: "AMC", startYear: 1970 },
  { name: "Pacer", make: "AMC", startYear: 1975 },
  { name: "Hornet", make: "AMC", startYear: 1970 },
  { name: "Javelin", make: "AMC", startYear: 1967 },
  { name: "AMX", make: "AMC", startYear: 1968 },
  { name: "Concord", make: "AMC", startYear: 1977 },
  { name: "Spirit", make: "AMC", startYear: 1979 },
  { name: "Eagle", make: "AMC", startYear: 1979 },

  // Eagle models
  { name: "Summit", make: "Eagle", startYear: 1988 },
  { name: "Talon", make: "Eagle", startYear: 1989 },
  { name: "Premier", make: "Eagle", startYear: 1987 },
  { name: "Vision", make: "Eagle", startYear: 1992 },

  // Studebaker models
  { name: "Avanti", make: "Studebaker", startYear: 1962 },
  { name: "Hawk", make: "Studebaker", startYear: 1956 },
  { name: "Lark", make: "Studebaker", startYear: 1958 },
  { name: "Commander", make: "Studebaker", startYear: 1927 },
  { name: "Champion", make: "Studebaker", startYear: 1939 },

  // More Indian brands
  { name: "Swift", make: "Maruti Suzuki", startYear: 2005 },
  { name: "Alto", make: "Maruti Suzuki", startYear: 2000 },
  { name: "Wagon R", make: "Maruti Suzuki", startYear: 1999 },
  { name: "Baleno", make: "Maruti Suzuki", startYear: 2015 },
  { name: "Dzire", make: "Maruti Suzuki", startYear: 2008 },
  { name: "Vitara Brezza", make: "Maruti Suzuki", startYear: 2016 },
  { name: "Ertiga", make: "Maruti Suzuki", startYear: 2012 },
  { name: "Celerio", make: "Maruti Suzuki", startYear: 2014 },

  // Iranian models
  { name: "Samand", make: "Iran Khodro", startYear: 2002 },
  { name: "Dena", make: "Iran Khodro", startYear: 2015 },
  { name: "Runna", make: "Iran Khodro", startYear: 2004 },
  { name: "Soren", make: "Iran Khodro", startYear: 2007 },

  { name: "Pride", make: "Saipa", startYear: 1993 },
  { name: "Tiba", make: "Saipa", startYear: 2008 },
  { name: "Quick", make: "Saipa", startYear: 2010 },

  // Proton models
  { name: "Saga", make: "Proton", startYear: 1985 },
  { name: "Wira", make: "Proton", startYear: 1993 },
  { name: "Persona", make: "Proton", startYear: 2007 },
  { name: "X50", make: "Proton", startYear: 2020 },
  { name: "X70", make: "Proton", startYear: 2018 },
  { name: "Exora", make: "Proton", startYear: 2009 },

  // Perodua models  
  { name: "Myvi", make: "Perodua", startYear: 2005 },
  { name: "Viva", make: "Perodua", startYear: 2007 },
  { name: "Alza", make: "Perodua", startYear: 2009 },
  { name: "Axia", make: "Perodua", startYear: 2014 },
  { name: "Bezza", make: "Perodua", startYear: 2016 },
  { name: "Aruz", make: "Perodua", startYear: 2019 },

  // And many more for other brands...
  { name: "Hunter", make: "UAZ", startYear: 2003 },
  { name: "Patriot", make: "UAZ", startYear: 2005 },
  { name: "469", make: "UAZ", startYear: 1972 },
  { name: "Pickup", make: "UAZ", startYear: 2008 },

  { name: "5320", make: "Kamaz", startYear: 1976 },
  { name: "65116", make: "Kamaz", startYear: 2003 },
  { name: "4308", make: "Kamaz", startYear: 1995 },

  { name: "Volga", make: "GAZ", startYear: 1956 },
  { name: "Sobol", make: "GAZ", startYear: 1998 },
  { name: "Gazelle", make: "GAZ", startYear: 1994 },
  { name: "3102", make: "GAZ", startYear: 1981 }
];

// Combine all models
const allModels = [...existingModels, ...additionalModels, ...additionalBrandModels];

// Write the expanded models file
fs.writeFileSync(
  path.join(__dirname, 'data', 'models.json'),
  JSON.stringify(allModels, null, 2)
);

console.log(`Added ${additionalModels.length + additionalBrandModels.length} new models`);
console.log(`Total models: ${allModels.length}`);
console.log('Models file updated successfully!'); 