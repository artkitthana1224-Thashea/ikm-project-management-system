const fs = require('fs');

const raw = `
WR-2025029
กลาง
closed
P-AAA00990
Map Ta Phut
2026-09-19

WR-2025001
ต่ำ
pending
Routine pump inspection — P-1203
Rayong Refinery
2025-09-06

WR-2025002
กลาง
assigned
Replace corroded pipe segment Line-7B
Map Ta Phut
2025-09-07
Manop Songsuk

WR-2025003
สูง
accepted
Annual pressure vessel certification
Sriracha Plant
2025-09-08
Pipob Suksan

WR-2025004
วิกฤต
in progress
Scaffold erection at Tower C-4
Bangkok HQ
2025-09-09
Chala Inthara

WR-2025005
ต่ำ
review
Emergency leak repair, Tank Farm 2
Chonburi Yard
2025-09-10
Prida Charoensuk

WR-2025006
กลาง
completed
Electrical panel thermal scan
Rayong Refinery
2025-09-11
Jira Rakthai

WR-2025007
สูง
closed
Crane preventive maintenance CH-08
Map Ta Phut
2025-09-12
Panu Boonmee

WR-2025008
วิกฤต
pending
NDT ultrasonic test on weld joints
Sriracha Plant
2025-09-13

WR-2025009
ต่ำ
assigned
HSE walkdown — Unit 300
Bangkok HQ
2025-09-14
Ekachai Jaidee

WR-2025010
กลาง
accepted
Instrument calibration loop check
Chonburi Yard
2025-09-15
Anchalee Songsuk

WR-2025011
สูง
in progress
Valve overhaul V-2245
Rayong Refinery
2025-09-16
Wichai Suksan

WR-2025012
วิกฤต
review
Heat exchanger cleaning E-105
Map Ta Phut
2025-09-17
Arun Inthara

WR-2025013
ต่ำ
completed
Routine pump inspection — P-1203
Sriracha Plant
2025-09-18
Kitti Charoensuk

WR-2025014
กลาง
closed
Replace corroded pipe segment Line-7B
Bangkok HQ
2025-09-19
Somying Rakthai

WR-2025015
สูง
pending
Annual pressure vessel certification
Chonburi Yard
2025-09-20

WR-2025016
วิกฤต
assigned
Scaffold erection at Tower C-4
Rayong Refinery
2025-09-21
Theera Pongpaiboon

WR-2025017
ต่ำ
accepted
Emergency leak repair, Tank Farm 2
Map Ta Phut
2025-09-22
Somchai Jaidee

WR-2025018
กลาง
in progress
Electrical panel thermal scan
Sriracha Plant
2025-09-23
Manop Songsuk

WR-2025019
สูง
review
Crane preventive maintenance CH-08
Bangkok HQ
2025-09-24
Pipob Suksan

WR-2025020
วิกฤต
completed
NDT ultrasonic test on weld joints
Chonburi Yard
2025-09-25
Chala Inthara

WR-2025021
ต่ำ
closed
HSE walkdown — Unit 300
Rayong Refinery
2025-09-26
Prida Charoensuk

WR-2025022
กลาง
pending
Instrument calibration loop check
Map Ta Phut
2025-09-27

WR-2025023
สูง
assigned
Valve overhaul V-2245
Sriracha Plant
2025-09-28
Panu Boonmee

WR-2025024
วิกฤต
accepted
Heat exchanger cleaning E-105
Bangkok HQ
2025-09-01
Anucha Pongpaiboon

WR-2025025
ต่ำ
in progress
Routine pump inspection — P-1203
Chonburi Yard
2025-09-02
Somchai Jaidee

WR-2025026
กลาง
review
Replace corroded pipe segment Line-7B
Rayong Refinery
2025-09-03
Manop Songsuk

WR-2025027
สูง
completed
Annual pressure vessel certification
Map Ta Phut
2025-09-04
Pipob Suksan

WR-2025028
วิกฤต
closed
Scaffold erection at Tower C-4
Sriracha Plant
2025-09-05
Chala Inthara
`;

const mapPriority = {
  'ต่ำ': 'Low',
  'กลาง': 'Medium',
  'สูง': 'High',
  'วิกฤต': 'Critical'
};

const mapStatus = {
  'pending': 'Pending',
  'assigned': 'Assigned',
  'accepted': 'Accepted',
  'in progress': 'In Progress',
  'review': 'Review',
  'completed': 'Completed',
  'closed': 'Closed'
};

const blocks = raw.trim().split('\n\n');
const results = blocks.map(block => {
  const lines = block.split('\n');
  const id = lines[0];
  const priority = mapPriority[lines[1]];
  const status = mapStatus[lines[2]];
  const title = lines[3];
  const location = lines[4];
  const dueDate = lines[5];
  const assignee = lines[6] || null;
  
  return { id, priority, status, title, location, dueDate, assignee };
});

console.log(JSON.stringify(results, null, 2));
