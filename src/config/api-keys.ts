
// API configuration with the provided API keys
export const API_KEYS = {
  MAPBOX_API_KEY: 'sk.eyJ1IjoiY2hhbmRyYWhhc2s1MzUiLCJhIjoiY21iNjMzd2VqMmZzcjJrcXpsNmoyZmxuNCJ9.BhF06QDz8fii1_HaypnBGw',
  OPENWEATHER_API_KEY: '31e340cdda515ddd9ae5cc476eeba7b6',
  NASA_API_KEY: '3zJgwMNFnYFGmqqjdyqg7wWdOhYRFs0TMpNZI6F4',
  NASA_TECHPORT_TOKEN: 'eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJUZWNoUG9ydCIsImV4cCI6MTc0ODQxMTcyOSwibmJmIjoxNzQ4MzI1MzI5LCJTRVNTSU9OX0lEIjoiaVM5TG9vdHFycWI1YUlNdHFpOUY1TkpMU25LTE1jNUpjdEtYIiwiRklOR0VSUFJJTlRfSEFTSCI6IjAxOUY4N0U3REI4MzgzOUJEQjlFQUIxN0M3QUJDOEFCRDZBOUE3RDdBOTBCQjA5QThDRTJBOTQ3MTAxMUI5RDYifQ.kgE-wVx-s2-D4DYwIEARVxe8rm0Kuz6Ap1R4fC_1YaQ',
  BHUVAN_TOKEN: '21dee4e5f0d489d5108b8c68a4e0037edc310cff',
  GEOID_TOKEN: 'fde004c6ed39d1ce608d6a4b9b50727d7c7916b9',
  ROUTING_TOKEN: '58b719d62c0449bd65623eecbeb00bf54820ec2f',
  LULC_AOI_TOKEN: '6dbf5cfa63faf8cc18abc46bfa59e66abdd6ae13',
  LULC_STATISTICS_TOKEN: 'e1d917de03a931f88b9d8dec761df10e1fa80158'
};

export const API_ENDPOINTS = {
  MAPBOX_GEOCODING: 'https://api.mapbox.com/geocoding/v5/mapbox.places',
  OPENWEATHER_BASE: 'https://api.openweathermap.org/data/2.5',
  NASA_EARTH: 'https://api.nasa.gov/planetary/earth',
  NASA_TECHPORT: 'https://api.nasa.gov/techport/api',
  BHUVAN_BASE: 'https://bhuvan.nrsc.gov.in/api',
  GEOID_API: 'https://bhuvan.nrsc.gov.in/api/geoid',
  ROUTING_API: 'https://bhuvan.nrsc.gov.in/api/routing',
  LULC_API: 'https://bhuvan.nrsc.gov.in/api/lulc'
};

// Check if we're missing the Mapbox token
export const isMapboxConfigured = () => {
  return API_KEYS.MAPBOX_API_KEY && API_KEYS.MAPBOX_API_KEY.length > 10;
};
