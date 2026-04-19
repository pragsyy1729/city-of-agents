import { buyFood, payRent, workShift, lookForJob, applyForJob, moveDistrict } from './world.js'
import { sendMessage, recruit, spreadRumour, callMeeting, trade } from './social.js'
import { readNoticeBoard, checkAgentStatus, investigate, readMessages } from './info.js'
import { fileComplaint, publishStory, bribe, callStrike, organiseProtest, reportSuspicious } from './power.js'
import { treatPatient, rest, buyMedicine, consultDoctor } from './health.js'

export const TOOL_REGISTRY = {
  buy_food: buyFood,
  pay_rent: payRent,
  work_shift: workShift,
  look_for_job: lookForJob,
  apply_for_job: applyForJob,
  move_district: moveDistrict,
  send_message: sendMessage,
  recruit,
  spread_rumour: spreadRumour,
  call_meeting: callMeeting,
  trade,
  read_notice_board: readNoticeBoard,
  check_agent_status: checkAgentStatus,
  investigate,
  read_messages: readMessages,
  file_complaint: fileComplaint,
  publish_story: publishStory,
  bribe,
  call_strike: callStrike,
  organise_protest: organiseProtest,
  treat_patient: treatPatient,
  rest,
  buy_medicine: buyMedicine,
  consult_doctor: consultDoctor,
  report_suspicious: reportSuspicious,
}

export function callTool(name, agent, world, params = {}) {
  const fn = TOOL_REGISTRY[name] ?? TOOL_REGISTRY.rest
  return fn(agent, world, params)
}
