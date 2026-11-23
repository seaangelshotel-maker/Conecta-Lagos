import { OFFICIAL_EVENTS_EXTRA } from '../data/officialEventsExtra';
console.log(JSON.stringify(OFFICIAL_EVENTS_EXTRA.map(e=>({id:e.id,title:e.title,start:e.startDate,end:e.endDate,city:e.cityId,loc:e.locationName,cat:e.category}))));
