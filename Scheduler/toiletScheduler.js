const schedule = require('node-schedule');
const {toiletLogger} = require('../Common/logger');
const {fetchToiletData} = require('../API/Services/toiletService');


module.exports.init = async () => {
  const toiletRule = new schedule.RecurrenceRule();
  toiletRule.month = [4, 10];
  toiletRule.date = 28;
  toiletRule.tz = 'Asia/Seoul';

  const toiletJob = schedule.scheduleJob(toiletRule, async () => {
    toiletLogger.info('[SCHEDULER] Fetch toilet data');
    const result = await fetchToiletData();
  });
}