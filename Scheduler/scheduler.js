const schedule = require('node-schedule');
const {toiletLogger, totoLogger} = require('../Common/logger');
const fetchToilet = require('../API/Services/toiletService').fetchToiletData;
const fetchToto = require('../API/Services/totoService').fetchTotoData;


module.exports.init = async () => {
  // Toilet scheduler
  const toiletRule = new schedule.RecurrenceRule();
  toiletRule.month = [3, 9];
  toiletRule.date = 28;
  toiletRule.hour = 0;
  toiletRule.minute = 0;
  toiletRule.tz = 'Asia/Seoul';

  const toiletJob = schedule.scheduleJob(toiletRule, async () => {
    toiletLogger.info('[SCHEDULER] Fetch toilet data');
    const result = await fetchToilet();
  });

  // Toto scheduler
  const totoRule = new schedule.RecurrenceRule();
  totoRule.month = [2, 5, 8, 11];
  totoRule.date = 15;
  totoRule.hour = 0;
  totoRule.minute = 0;
  totoRule.tz = 'Asia/Seoul';

  const totoJob = schedule.scheduleJob(totoRule, async () => {
    totoLogger.info('[SCHEDULER] Fetch toto data');
    const result = await fetchToto();
  });

}