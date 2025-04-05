export interface NeighborhoodInfo {
  name: string;
  abbreviation: string;
  borough: {
    name: string;
    abbreviation: string;
  };
}

interface Neighborhood {
  name: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

// Mapping of zip codes to neighborhood info
export const ZIP_TO_NEIGHBORHOOD: Record<string, NeighborhoodInfo> = {
  // Manhattan (MH)
  "10001": { name: "Midtown", abbreviation: "MIDTWN", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10002": { name: "Chinatown", abbreviation: "CHNTWN", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10003": { name: "East Village", abbreviation: "EST VLG", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10004": { name: "Financial District", abbreviation: "FIN DST", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10005": { name: "Financial District", abbreviation: "FIN DST", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10006": { name: "Financial District", abbreviation: "FIN DST", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10007": { name: "Tribeca", abbreviation: "TRBC", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10009": { name: "East Village", abbreviation: "EST VLG", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10010": { name: "Gramercy", abbreviation: "GRMRCY", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10011": { name: "Chelsea", abbreviation: "CHLSA", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10012": { name: "Greenwich Village", abbreviation: "GRN VLG", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10013": { name: "SoHo", abbreviation: "SOHO", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10014": { name: "West Village", abbreviation: "WST VLG", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10016": { name: "Murray Hill", abbreviation: "MRY HL", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10017": { name: "Midtown East", abbreviation: "MID E", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10018": { name: "Midtown West", abbreviation: "MID W", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10019": { name: "Midtown West", abbreviation: "MID W", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10020": { name: "Midtown West", abbreviation: "MID W", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10021": { name: "Upper East Side", abbreviation: "UES", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10022": { name: "Midtown East", abbreviation: "MID E", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10023": { name: "Upper West Side", abbreviation: "UWS", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10024": { name: "Upper West Side", abbreviation: "UWS", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10025": { name: "Upper West Side", abbreviation: "UWS", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10026": { name: "Harlem", abbreviation: "HRLM", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10027": { name: "Harlem", abbreviation: "HRLM", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10028": { name: "Upper East Side", abbreviation: "UES", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10029": { name: "East Harlem", abbreviation: "E HRLM", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10030": { name: "Harlem", abbreviation: "HRLM", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10031": { name: "Hamilton Heights", abbreviation: "HML HTS", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10032": { name: "Washington Heights", abbreviation: "WSH HTS", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10033": { name: "Washington Heights", abbreviation: "WSH HTS", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10034": { name: "Inwood", abbreviation: "INWD", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10035": { name: "East Harlem", abbreviation: "E HRLM", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10036": { name: "Midtown West", abbreviation: "MID W", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10037": { name: "Harlem", abbreviation: "HRLM", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10038": { name: "Financial District", abbreviation: "FIN DST", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10039": { name: "Harlem", abbreviation: "HRLM", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10040": { name: "Washington Heights", abbreviation: "WSH HTS", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10044": { name: "Roosevelt Island", abbreviation: "RSV ISL", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10065": { name: "Upper East Side", abbreviation: "UES", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10069": { name: "Upper West Side", abbreviation: "UWS", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10075": { name: "Upper East Side", abbreviation: "UES", borough: { name: "Manhattan", abbreviation: "MH" }},
  "10128": { name: "Upper East Side", abbreviation: "UES", borough: { name: "Manhattan", abbreviation: "MH" }},

  // Brooklyn (BK)
  "11201": { name: "Brooklyn Heights", abbreviation: "BK HTS", borough: { name: "Brooklyn", abbreviation: "BK" }},
  "11205": { name: "Bedford-Stuyvesant", abbreviation: "BED STY", borough: { name: "Brooklyn", abbreviation: "BK" }},
  "11206": { name: "Williamsburg", abbreviation: "WLMSBRG", borough: { name: "Brooklyn", abbreviation: "BK" }},
  "11207": { name: "Bushwick", abbreviation: "BSHWK", borough: { name: "Brooklyn", abbreviation: "BK" }},
  "11208": { name: "New Lots", abbreviation: "NW LTS", borough: { name: "Brooklyn", abbreviation: "BK" }},
  "11209": { name: "Bay Ridge", abbreviation: "BY RDG", borough: { name: "Brooklyn", abbreviation: "BK" }},
  "11210": { name: "Flatbush", abbreviation: "FLTBSH", borough: { name: "Brooklyn", abbreviation: "BK" }},
  "11211": { name: "Williamsburg", abbreviation: "WLMSBRG", borough: { name: "Brooklyn", abbreviation: "BK" }},
  "11212": { name: "Brownsville", abbreviation: "BRWNSVL", borough: { name: "Brooklyn", abbreviation: "BK" }},
  "11213": { name: "Crown Heights", abbreviation: "CRWN HTS", borough: { name: "Brooklyn", abbreviation: "BK" }},
  "11214": { name: "Bensonhurst", abbreviation: "BNSHNST", borough: { name: "Brooklyn", abbreviation: "BK" }},
  "11215": { name: "Park Slope", abbreviation: "PRK SLP", borough: { name: "Brooklyn", abbreviation: "BK" }},
  "11216": { name: "Bedford-Stuyvesant", abbreviation: "BED STY", borough: { name: "Brooklyn", abbreviation: "BK" }},
  "11217": { name: "Boerum Hill", abbreviation: "BRM HL", borough: { name: "Brooklyn", abbreviation: "BK" }},
  "11218": { name: "Kensington", abbreviation: "KNSGTN", borough: { name: "Brooklyn", abbreviation: "BK" }},
  "11219": { name: "Borough Park", abbreviation: "BR PRT", borough: { name: "Brooklyn", abbreviation: "BK" }},
  "11220": { name: "Sunset Park", abbreviation: "SNS PK", borough: { name: "Brooklyn", abbreviation: "BK" }},
  "11221": { name: "Bedford-Stuyvesant", abbreviation: "BED STY", borough: { name: "Brooklyn", abbreviation: "BK" }},
  "11222": { name: "Greenpoint", abbreviation: "GRN PNT", borough: { name: "Brooklyn", abbreviation: "BK" }},
  "11223": { name: "Gravesend", abbreviation: "GRVSND", borough: { name: "Brooklyn", abbreviation: "BK" }},
  "11224": { name: "Coney Island", abbreviation: "CNY ISL", borough: { name: "Brooklyn", abbreviation: "BK" }},
  "11225": { name: "Prospect Heights", abbreviation: "PRSPCT", borough: { name: "Brooklyn", abbreviation: "BK" }},
  "11226": { name: "Flatbush", abbreviation: "FLTBSH", borough: { name: "Brooklyn", abbreviation: "BK" }},
  "11228": { name: "Bay Ridge", abbreviation: "BY RDG", borough: { name: "Brooklyn", abbreviation: "BK" }},
  "11229": { name: "Sheepshead Bay", abbreviation: "SHP BY", borough: { name: "Brooklyn", abbreviation: "BK" }},
  "11230": { name: "Midwood", abbreviation: "MIDWD", borough: { name: "Brooklyn", abbreviation: "BK" }},
  "11231": { name: "Red Hook", abbreviation: "RED HK", borough: { name: "Brooklyn", abbreviation: "BK" }},
  "11232": { name: "Sunset Park", abbreviation: "SNS PK", borough: { name: "Brooklyn", abbreviation: "BK" }},
  "11233": { name: "Bedford-Stuyvesant", abbreviation: "BED STY", borough: { name: "Brooklyn", abbreviation: "BK" }},
  "11234": { name: "Flatlands", abbreviation: "FLT LNDS", borough: { name: "Brooklyn", abbreviation: "BK" }},
  "11235": { name: "Brighton Beach", abbreviation: "BRGHTN", borough: { name: "Brooklyn", abbreviation: "BK" }},
  "11236": { name: "Canarsie", abbreviation: "CNSR", borough: { name: "Brooklyn", abbreviation: "BK" }},
  "11237": { name: "Bushwick", abbreviation: "BSHWK", borough: { name: "Brooklyn", abbreviation: "BK" }},
  "11238": { name: "Clinton Hill", abbreviation: "CLTN HL", borough: { name: "Brooklyn", abbreviation: "BK" }},
  "11239": { name: "East New York", abbreviation: "E NY", borough: { name: "Brooklyn", abbreviation: "BK" }},

  // Queens (QN)
  "11101": { name: "Long Island City", abbreviation: "LIC", borough: { name: "Queens", abbreviation: "QN" }},
  "11102": { name: "Astoria", abbreviation: "ASTRIA", borough: { name: "Queens", abbreviation: "QN" }},
  "11103": { name: "Astoria", abbreviation: "ASTRIA", borough: { name: "Queens", abbreviation: "QN" }},
  "11104": { name: "Sunnyside", abbreviation: "SNSD", borough: { name: "Queens", abbreviation: "QN" }},
  "11105": { name: "Astoria", abbreviation: "ASTRIA", borough: { name: "Queens", abbreviation: "QN" }},
  "11106": { name: "Astoria", abbreviation: "ASTRIA", borough: { name: "Queens", abbreviation: "QN" }},
  "11354": { name: "Flushing", abbreviation: "FLUSHNG", borough: { name: "Queens", abbreviation: "QN" }},
  "11355": { name: "Flushing", abbreviation: "FLUSHNG", borough: { name: "Queens", abbreviation: "QN" }},
  "11356": { name: "College Point", abbreviation: "CLG PNT", borough: { name: "Queens", abbreviation: "QN" }},
  "11357": { name: "Whitestone", abbreviation: "WHTSTNE", borough: { name: "Queens", abbreviation: "QN" }},
  "11358": { name: "Flushing", abbreviation: "FLUSHNG", borough: { name: "Queens", abbreviation: "QN" }},
  "11360": { name: "Bayside", abbreviation: "BYSDE", borough: { name: "Queens", abbreviation: "QN" }},
  "11361": { name: "Bayside", abbreviation: "BYSDE", borough: { name: "Queens", abbreviation: "QN" }},
  "11362": { name: "Little Neck", abbreviation: "LT NLK", borough: { name: "Queens", abbreviation: "QN" }},
  "11363": { name: "Little Neck", abbreviation: "LT NLK", borough: { name: "Queens", abbreviation: "QN" }},
  "11364": { name: "Oakland Gardens", abbreviation: "OKLND", borough: { name: "Queens", abbreviation: "QN" }},
  "11365": { name: "Fresh Meadows", abbreviation: "FRSH MD", borough: { name: "Queens", abbreviation: "QN" }},
  "11366": { name: "Fresh Meadows", abbreviation: "FRSH MD", borough: { name: "Queens", abbreviation: "QN" }},
  "11367": { name: "Kew Gardens Hills", abbreviation: "KEW HL", borough: { name: "Queens", abbreviation: "QN" }},
  "11368": { name: "Corona", abbreviation: "CRNA", borough: { name: "Queens", abbreviation: "QN" }},
  "11369": { name: "East Elmhurst", abbreviation: "E ELM", borough: { name: "Queens", abbreviation: "QN" }},
  "11370": { name: "Elmhurst", abbreviation: "ELMHST", borough: { name: "Queens", abbreviation: "QN" }},
  "11371": { name: "Jackson Heights", abbreviation: "JCK HTS", borough: { name: "Queens", abbreviation: "QN" }},
  "11372": { name: "Jackson Heights", abbreviation: "JCK HTS", borough: { name: "Queens", abbreviation: "QN" }},
  "11373": { name: "Elmhurst", abbreviation: "ELMHST", borough: { name: "Queens", abbreviation: "QN" }},
  "11374": { name: "Rego Park", abbreviation: "RGO PK", borough: { name: "Queens", abbreviation: "QN" }},
  "11375": { name: "Forest Hills", abbreviation: "FRST HL", borough: { name: "Queens", abbreviation: "QN" }},
  "11377": { name: "Woodside", abbreviation: "WDSD", borough: { name: "Queens", abbreviation: "QN" }},
  "11378": { name: "Maspeth", abbreviation: "MSPTH", borough: { name: "Queens", abbreviation: "QN" }},
  "11379": { name: "Middle Village", abbreviation: "MDL VLG", borough: { name: "Queens", abbreviation: "QN" }},
  "11385": { name: "Ridgewood", abbreviation: "RDGWD", borough: { name: "Queens", abbreviation: "QN" }},
  "11411": { name: "Cambria Heights", abbreviation: "CAM HTS", borough: { name: "Queens", abbreviation: "QN" }},
  "11412": { name: "Saint Albans", abbreviation: "ST ALBN", borough: { name: "Queens", abbreviation: "QN" }},
  "11413": { name: "Springfield Gardens", abbreviation: "SPFLD", borough: { name: "Queens", abbreviation: "QN" }},
  "11414": { name: "Howard Beach", abbreviation: "HW BCH", borough: { name: "Queens", abbreviation: "QN" }},
  "11415": { name: "Kew Gardens", abbreviation: "KEW GDN", borough: { name: "Queens", abbreviation: "QN" }},
  "11416": { name: "Ozone Park", abbreviation: "OZN PK", borough: { name: "Queens", abbreviation: "QN" }},
  "11417": { name: "Ozone Park", abbreviation: "OZN PK", borough: { name: "Queens", abbreviation: "QN" }},
  "11418": { name: "Richmond Hill", abbreviation: "RCH HL", borough: { name: "Queens", abbreviation: "QN" }},
  "11419": { name: "South Ozone Park", abbreviation: "SO OZN", borough: { name: "Queens", abbreviation: "QN" }},
  "11420": { name: "South Ozone Park", abbreviation: "SO OZN", borough: { name: "Queens", abbreviation: "QN" }},
  "11421": { name: "Woodhaven", abbreviation: "WDHVN", borough: { name: "Queens", abbreviation: "QN" }},
  "11422": { name: "Rosedale", abbreviation: "RSDL", borough: { name: "Queens", abbreviation: "QN" }},
  "11423": { name: "Hollis", abbreviation: "HLLS", borough: { name: "Queens", abbreviation: "QN" }},
  "11424": { name: "Jamaica", abbreviation: "JMAICA", borough: { name: "Queens", abbreviation: "QN" }},
  "11425": { name: "Jamaica", abbreviation: "JMAICA", borough: { name: "Queens", abbreviation: "QN" }},
  "11426": { name: "Bellerose", abbreviation: "BLLRS", borough: { name: "Queens", abbreviation: "QN" }},
  "11427": { name: "Queens Village", abbreviation: "QNS VLG", borough: { name: "Queens", abbreviation: "QN" }},
  "11428": { name: "Queens Village", abbreviation: "QNS VLG", borough: { name: "Queens", abbreviation: "QN" }},
  "11429": { name: "Queens Village", abbreviation: "QNS VLG", borough: { name: "Queens", abbreviation: "QN" }},
  "11430": { name: "Jamaica", abbreviation: "JMAICA", borough: { name: "Queens", abbreviation: "QN" }},
  "11432": { name: "Jamaica", abbreviation: "JMAICA", borough: { name: "Queens", abbreviation: "QN" }},
  "11433": { name: "Jamaica", abbreviation: "JMAICA", borough: { name: "Queens", abbreviation: "QN" }},
  "11434": { name: "Jamaica", abbreviation: "JMAICA", borough: { name: "Queens", abbreviation: "QN" }},
  "11435": { name: "Jamaica", abbreviation: "JMAICA", borough: { name: "Queens", abbreviation: "QN" }},
  "11436": { name: "Jamaica", abbreviation: "JMAICA", borough: { name: "Queens", abbreviation: "QN" }},

  // Bronx (BX)
  "10451": { name: "South Bronx", abbreviation: "S BRNX", borough: { name: "Bronx", abbreviation: "BX" }},
  "10452": { name: "South Bronx", abbreviation: "S BRNX", borough: { name: "Bronx", abbreviation: "BX" }},
  "10453": { name: "University Heights", abbreviation: "UNV HTS", borough: { name: "Bronx", abbreviation: "BX" }},
  "10454": { name: "Port Morris", abbreviation: "PRT MRS", borough: { name: "Bronx", abbreviation: "BX" }},
  "10455": { name: "South Bronx", abbreviation: "S BRNX", borough: { name: "Bronx", abbreviation: "BX" }},
  "10456": { name: "Morrisania", abbreviation: "MRRSNA", borough: { name: "Bronx", abbreviation: "BX" }},
  "10457": { name: "Tremont", abbreviation: "TRMNT", borough: { name: "Bronx", abbreviation: "BX" }},
  "10458": { name: "Fordham", abbreviation: "FRDHM", borough: { name: "Bronx", abbreviation: "BX" }},
  "10459": { name: "Longwood", abbreviation: "LNGWD", borough: { name: "Bronx", abbreviation: "BX" }},
  "10460": { name: "Belmont", abbreviation: "BLMNT", borough: { name: "Bronx", abbreviation: "BX" }},
  "10461": { name: "Westchester Square", abbreviation: "WCH SQ", borough: { name: "Bronx", abbreviation: "BX" }},
  "10462": { name: "Throggs Neck", abbreviation: "THRGG", borough: { name: "Bronx", abbreviation: "BX" }},
  "10463": { name: "Riverdale", abbreviation: "RVRDL", borough: { name: "Bronx", abbreviation: "BX" }},
  "10464": { name: "Riverdale", abbreviation: "RVRDL", borough: { name: "Bronx", abbreviation: "BX" }},
  "10465": { name: "Country Club", abbreviation: "CTY CLB", borough: { name: "Bronx", abbreviation: "BX" }},
  "10466": { name: "Williamsbridge", abbreviation: "WMSBRG", borough: { name: "Bronx", abbreviation: "BX" }},
  "10467": { name: "Norwood", abbreviation: "NRWD", borough: { name: "Bronx", abbreviation: "BX" }},
  "10468": { name: "Kingsbridge", abbreviation: "KNGSBRG", borough: { name: "Bronx", abbreviation: "BX" }},
  "10469": { name: "Eastchester", abbreviation: "ESTCHR", borough: { name: "Bronx", abbreviation: "BX" }},
  "10470": { name: "Eastchester", abbreviation: "ESTCHR", borough: { name: "Bronx", abbreviation: "BX" }},
  "10471": { name: "Fieldston", abbreviation: "FLDSTN", borough: { name: "Bronx", abbreviation: "BX" }},
  "10472": { name: "Soundview", abbreviation: "SNDVW", borough: { name: "Bronx", abbreviation: "BX" }},
  "10473": { name: "Castle Hill", abbreviation: "CST HL", borough: { name: "Bronx", abbreviation: "BX" }},
  "10474": { name: "Port Morris", abbreviation: "PRT MRS", borough: { name: "Bronx", abbreviation: "BX" }},
  "10475": { name: "City Island", abbreviation: "CTY ISL", borough: { name: "Bronx", abbreviation: "BX" }},

  // Staten Island (SI)
  "10301": { name: "St. George", abbreviation: "ST GRG", borough: { name: "Staten Island", abbreviation: "SI" }},
  "10302": { name: "New Brighton", abbreviation: "NW BRGHT", borough: { name: "Staten Island", abbreviation: "SI" }},
  "10303": { name: "Stapleton", abbreviation: "STPLTN", borough: { name: "Staten Island", abbreviation: "SI" }},
  "10304": { name: "Grasmere", abbreviation: "GRSMR", borough: { name: "Staten Island", abbreviation: "SI" }},
  "10305": { name: "Midland Beach", abbreviation: "MDLD B", borough: { name: "Staten Island", abbreviation: "SI" }},
  "10306": { name: "New Dorp", abbreviation: "NW DRP", borough: { name: "Staten Island", abbreviation: "SI" }},
  "10307": { name: "Tottenville", abbreviation: "TTNVL", borough: { name: "Staten Island", abbreviation: "SI" }},
  "10308": { name: "Great Kills", abbreviation: "GRT KLS", borough: { name: "Staten Island", abbreviation: "SI" }},
  "10309": { name: "Eltingville", abbreviation: "ELTNGVL", borough: { name: "Staten Island", abbreviation: "SI" }},
  "10310": { name: "Port Richmond", abbreviation: "PRT RCH", borough: { name: "Staten Island", abbreviation: "SI" }},
  "10311": { name: "Graniteville", abbreviation: "GRNTVL", borough: { name: "Staten Island", abbreviation: "SI" }},
  "10312": { name: "Annadale", abbreviation: "ANNDL", borough: { name: "Staten Island", abbreviation: "SI" }},
  "10314": { name: "Todt Hill", abbreviation: "TODT HL", borough: { name: "Staten Island", abbreviation: "SI" }}
};

const neighborhoods: Neighborhood[] = [
  {
    name: "Bedford-Stuyvesant, Brooklyn",
    bounds: {
      north: 40.697,
      south: 40.675,
      east: -73.919,
      west: -73.956
    }
  },
  {
    name: "Williamsburg, Brooklyn",
    bounds: {
      north: 40.725,
      south: 40.697,
      east: -73.936,
      west: -73.965
    }
  },
  {
    name: "Harlem, Manhattan",
    bounds: {
      north: 40.815,
      south: 40.800,
      east: -73.930,
      west: -73.950
    }
  },
  {
    name: "Upper East Side, Manhattan",
    bounds: {
      north: 40.785,
      south: 40.760,
      east: -73.930,
      west: -73.960
    }
  },
  {
    name: "Upper West Side, Manhattan",
    bounds: {
      north: 40.800,
      south: 40.770,
      east: -73.960,
      west: -73.990
    }
  },
  {
    name: "Midtown, Manhattan",
    bounds: {
      north: 40.760,
      south: 40.740,
      east: -73.970,
      west: -74.000
    }
  },
  {
    name: "Chelsea, Manhattan",
    bounds: {
      north: 40.750,
      south: 40.740,
      east: -73.990,
      west: -74.010
    }
  },
  {
    name: "Greenwich Village, Manhattan",
    bounds: {
      north: 40.740,
      south: 40.730,
      east: -73.990,
      west: -74.010
    }
  },
  {
    name: "SoHo, Manhattan",
    bounds: {
      north: 40.730,
      south: 40.720,
      east: -73.990,
      west: -74.010
    }
  },
  {
    name: "Financial District, Manhattan",
    bounds: {
      north: 40.720,
      south: 40.700,
      east: -73.990,
      west: -74.020
    }
  },
  {
    name: "Astoria, Queens",
    bounds: {
      north: 40.780,
      south: 40.760,
      east: -73.900,
      west: -73.930
    }
  },
  {
    name: "Long Island City, Queens",
    bounds: {
      north: 40.750,
      south: 40.730,
      east: -73.930,
      west: -73.960
    }
  },
  {
    name: "Flushing, Queens",
    bounds: {
      north: 40.770,
      south: 40.750,
      east: -73.800,
      west: -73.830
    }
  }
];

// Cache for zip code lookups
const zipCodeCache: Record<string, { lat: number; lng: number; zip: string }> = {};

// Pre-populate with common NYC zip codes and their approximate centers
const COMMON_NYC_ZIPS = {
  // Manhattan
  "10001": { lat: 40.7505, lng: -73.9934 }, // Midtown
  "10011": { lat: 40.7445, lng: -73.9995 }, // Chelsea
  "10012": { lat: 40.7255, lng: -73.9983 }, // Greenwich Village
  "10013": { lat: 40.7195, lng: -73.9995 }, // SoHo
  "10021": { lat: 40.7725, lng: -73.9585 }, // Upper East Side
  "10023": { lat: 40.7775, lng: -73.9815 }, // Upper West Side
  "10026": { lat: 40.8075, lng: -73.9405 }, // Harlem
  // Brooklyn
  "11211": { lat: 40.7125, lng: -73.9505 }, // Williamsburg
  "11205": { lat: 40.6955, lng: -73.9505 }, // Bedford-Stuyvesant
  "11215": { lat: 40.6675, lng: -73.9855 }, // Park Slope
  // Queens
  "11101": { lat: 40.7425, lng: -73.9355 }, // Long Island City
  "11102": { lat: 40.7725, lng: -73.9155 }, // Astoria
  "11354": { lat: 40.7675, lng: -73.8305 }  // Flushing
};

// Maximum cache size to prevent localStorage from getting too large
const MAX_CACHE_SIZE = 1000;

// Helper function to get neighborhood info from coordinates
export async function getNeighborhoodFromCoordinates(coordinates: { lat: number; lng: number }): Promise<NeighborhoodInfo | null> {
  try {
    // First check our local cache
    const cacheKey = `${coordinates.lat.toFixed(4)},${coordinates.lng.toFixed(4)}`;
    const cached = zipCodeCache[cacheKey];
    
    if (cached) {
      console.log('📦 Using cached zip code:', cached.zip);
      if (ZIP_TO_NEIGHBORHOOD[cached.zip]) {
        return ZIP_TO_NEIGHBORHOOD[cached.zip];
      }
    }

    // If not in cache, make API call
    console.log('🌐 Making API call for coordinates:', coordinates);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${coordinates.lat}&lon=${coordinates.lng}&format=json`
    );
    const data = await response.json();
    const zipCode = data.address?.postcode;

    if (zipCode) {
      // Cache the result
      zipCodeCache[cacheKey] = {
        lat: coordinates.lat,
        lng: coordinates.lng,
        zip: zipCode
      };
      
      // Manage cache size
      if (Object.keys(zipCodeCache).length > MAX_CACHE_SIZE) {
        // Remove oldest entries (first 100)
        const entries = Object.entries(zipCodeCache);
        entries.splice(0, 100);
        Object.assign(zipCodeCache, Object.fromEntries(entries));
      }
      
      // Try to save to localStorage
      try {
        localStorage.setItem('zipCodeCache', JSON.stringify(zipCodeCache));
      } catch (e) {
        console.warn('⚠️ Could not save to localStorage:', e);
      }

      if (ZIP_TO_NEIGHBORHOOD[zipCode]) {
        return ZIP_TO_NEIGHBORHOOD[zipCode];
      }
    }

    // Fallback for NYC
    return {
      name: "New York City",
      abbreviation: "NYC",
      borough: {
        name: "New York City",
        abbreviation: "NYC"
      }
    };
  } catch (error) {
    console.error('Error getting neighborhood:', error);
    return null;
  }
}

// Initialize cache from localStorage on module load
try {
  const savedCache = localStorage.getItem('zipCodeCache');
  if (savedCache) {
    Object.assign(zipCodeCache, JSON.parse(savedCache));
    console.log('📦 Loaded zip code cache from localStorage');
  } else {
    // Pre-populate with common NYC zip codes if no cache exists
    Object.entries(COMMON_NYC_ZIPS).forEach(([zip, coords]) => {
      const cacheKey = `${coords.lat.toFixed(4)},${coords.lng.toFixed(4)}`;
      zipCodeCache[cacheKey] = {
        lat: coords.lat,
        lng: coords.lng,
        zip
      };
    });
    console.log('📦 Pre-populated cache with common NYC zip codes');
  }
} catch (e) {
  console.warn('⚠️ Could not load from localStorage:', e);
}

// Helper function to format location display
export function formatLocationDisplay(neighborhoodInfo: NeighborhoodInfo | null, zoomLevel: number): string {
  if (!neighborhoodInfo) return 'NYC';
  
  const boroughAbbr = getBoroughAbbreviation(neighborhoodInfo.borough.name);
  
  if (zoomLevel >= ZOOM_THRESHOLD) {
    // Show neighborhood and borough when zoomed in
    const neighborhoodAbbr = getNeighborhoodAbbreviation(neighborhoodInfo.name);
    return `${neighborhoodAbbr}, ${boroughAbbr}`;
  } else {
    // Show just borough when zoomed out
    return boroughAbbr;
  }
}

function getBoroughAbbreviation(borough: string): string {
  switch (borough.toLowerCase()) {
    case 'manhattan': return 'MH';
    case 'brooklyn': return 'BK';
    case 'queens': return 'QN';
    case 'bronx': return 'BX';
    case 'staten island': return 'SI';
    default: return borough.toUpperCase();
  }
}

function getNeighborhoodAbbreviation(neighborhood: string): string {
  // Common neighborhood abbreviations
  const abbreviations: { [key: string]: string } = {
    'east village': 'EST VLG',
    'west village': 'WST VLG',
    'lower east side': 'LES',
    'upper east side': 'UES',
    'upper west side': 'UWS',
    'tribeca': 'TRB',
    'soho': 'SOHO',
    'noho': 'NOHO',
    'dumbo': 'DUMBO',
    'williamsburg': 'WMSBG',
    'bushwick': 'BSHWK',
    'bedford-stuyvesant': 'BEDSTUY',
    'crown heights': 'CRWN HTS',
    'park slope': 'PK SLOPE',
    'prospect heights': 'PRSPCT HTS',
    'astoria': 'AST',
    'long island city': 'LIC',
    'flushing': 'FLSH',
    'jackson heights': 'JXN HTS',
    'elmhurst': 'ELMH',
    'forest hills': 'FRST HLS',
    'kew gardens': 'KEW GDN',
    'rego park': 'REGO',
    'woodside': 'WDSD',
    'sunnyside': 'SNNYSD',
    'mott haven': 'MOTT HVN',
    'fordham': 'FRDHM',
    'pelham bay': 'PLHM BY',
    'riverdale': 'RVRDL',
    'wakefield': 'WKFLD',
    'st. george': 'ST G',
    'new dorp': 'NEW D',
    'tottenville': 'TOTTVL',
    'great kills': 'GRT KLS',
    'stapleton': 'STPLTN'
  };

  const lowerNeighborhood = neighborhood.toLowerCase();
  return abbreviations[lowerNeighborhood] || neighborhood.toUpperCase();
}

export function findNeighborhoodByCoords(lat: number, lng: number): Neighborhood | null {
  return neighborhoods.find(hood => 
    lat <= hood.bounds.north &&
    lat >= hood.bounds.south &&
    lng <= hood.bounds.east &&
    lng >= hood.bounds.west
  ) || null;
}

export const ZOOM_THRESHOLD = 12; // Zoom level at which we switch from borough to neighborhood 