import { MainEquipment, Employee } from '../types';

export const initialEquipmentList: MainEquipment[] = [
  {
    id: 'EQ-HYD-001',
    name: 'High-Pressure Hydrostatic Test Unit 15,000 PSI',
    code: 'IKM-EQ-HYD-01',
    serialNumber: 'SN-2024-8849-HY',
    category: 'Hydrotesting & Pressure Services',
    status: 'Available',
    location: 'IKM Rayong (RY)',
    assignedProject: 'P-2026-018: Site Expansion Project',
    assignedOperator: 'Anurak Techaporn',
    lastInspection: '2026-08-10',
    calibrationDue: '2026-11-15',
    manualFileName: 'Hydrotest_Unit_15K_PSI_TechManual.pdf',
    specsSummary: 'Max Working Pressure: 15,000 PSI, Flow Rate: 12 L/min, Dual Digital Pressure Gauge calibrated to ISO/IEC 17025.',
    isArchived: false,
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'EQ-TRQ-002',
    name: 'Hydraulic Torque Wrench Set & Power Pack',
    code: 'IKM-EQ-TRQ-04',
    serialNumber: 'SN-TORQ-9912-EXP',
    category: 'Flange Management & Bolting',
    status: 'In Use',
    location: 'IKM Laem Chabang (LKU)',
    assignedProject: 'P-2026-019: Turbine Generator Overhaul',
    assignedOperator: 'Kittipong Mechai',
    lastInspection: '2026-08-28',
    calibrationDue: '2026-10-05',
    manualFileName: 'Hydraulic_Torque_Wrench_SOP_Calibration.pdf',
    specsSummary: 'Torque Capacity: 250 - 4,500 Nm, Square Drive: 1-1/2", Anti-backlash ratchet mechanism, Explosion-proof electric pump.',
    isArchived: false,
    createdAt: '2026-02-01T09:30:00Z',
  },
  {
    id: 'EQ-NIT-003',
    name: 'Nitrogen Pumping Skid Unit 1000 SCFM',
    code: 'IKM-EQ-N2-02',
    serialNumber: 'SN-NITRO-4421-OFS',
    category: 'Nitrogen & Pipeline Services',
    status: 'Available',
    location: 'Offshore Rig (Mobile)',
    assignedProject: 'P-2026-020: Offshore Pipeline Purge',
    assignedOperator: 'Art Kitthana',
    lastInspection: '2026-07-15',
    calibrationDue: '2026-12-01',
    manualFileName: 'Nitrogen_Pumping_Skid_Operation_Guide.pdf',
    specsSummary: 'Capacity: 1,000 SCFM at 5,000 PSI, Vaporizer System: Ambient/Fired, Purity output: 99.9% N2, DNV 2.7-1 Offshore Certified Frame.',
    isArchived: false,
    createdAt: '2026-03-10T11:00:00Z',
  },
  {
    id: 'EQ-CAL-004',
    name: 'Fluke Multi-Function Process & Pressure Calibrator',
    code: 'IKM-EQ-CAL-08',
    serialNumber: 'SN-FLK-754-0032',
    category: 'Instrumentation & Calibration',
    status: 'Under Maintenance',
    location: 'IKM Rayong (RY)',
    assignedProject: 'P-2026-010: Substation SCADA Modernization',
    assignedOperator: 'Prasert Boonmee',
    lastInspection: '2026-09-01',
    calibrationDue: '2026-09-20', // Expiring soon (< 30 days)
    manualFileName: 'Fluke_754_HART_Calibrator_Certificate.pdf',
    specsSummary: 'Measures/sources volts, mA, RTDs, thermocouples, frequency, and ohms. HART communication support, rugged ATEX design.',
    isArchived: false,
    createdAt: '2026-04-05T14:15:00Z',
  },
  {
    id: 'EQ-RIG-005',
    name: 'Heavy Rigging Spreader Beam & Sling Set 25T',
    code: 'IKM-EQ-RIG-12',
    serialNumber: 'SN-RIG-25T-882',
    category: 'Rigging & Lifting Services',
    status: 'Available',
    location: 'IKM Laem Chabang (LKU)',
    assignedProject: 'P-2026-018: Site Expansion Project',
    assignedOperator: 'Siriwan Prasert',
    lastInspection: '2026-08-01',
    calibrationDue: '2027-02-01',
    manualFileName: 'Spreader_Beam_LoadTest_Certificate_25T.pdf',
    specsSummary: 'SWL: 25 Metric Tons, Adjustable span 2m to 6m, Proof Load Tested at 37.5T, EN 13155 & ASME B30.20 compliant.',
    isArchived: false,
    createdAt: '2026-05-12T10:00:00Z',
  },
  {
    id: 'EQ-WLD-006',
    name: 'Orbital Welding System & Pipe End Prep Lathe',
    code: 'IKM-EQ-WLD-03',
    serialNumber: 'SN-ORB-WELD-551',
    category: 'Welding & Fabrication',
    status: 'In Use',
    location: 'IKM Rayong (RY)',
    assignedProject: 'P-2026-018: Site Expansion Project',
    assignedOperator: 'Kittipong Mechai',
    lastInspection: '2026-08-15',
    calibrationDue: '2026-11-30',
    manualFileName: 'Orbital_TIG_Welder_SOP_Manual.pdf',
    specsSummary: 'Auto-TIG closed welding head 0.5" to 4.5" OD, Programmable micro-controller with real-time gas purge telemetry.',
    isArchived: false,
    createdAt: '2026-06-01T08:45:00Z',
  }
];

export const initialEnterpriseEmployees: Employee[] = [
  {
    id: '46de6855-477a-4a99-bb4c-7e627500fafa',
    name: 'Somchai W.',
    username: 'somchai.mgr',
    password: 'password123',
    role: 'Site Manager',
    userLevel: 'Manager',
    department: 'Operations',
    avatarColor: '#F58220',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    availability: 'available',
    utilization: 85,
    score: 96,
    skills: ['Operations', 'Safety Leadership', 'Site Management'],
    phone: '081-998-8776',
    email: 'somchai.s@ikm-ops.com',
    baseLocation: 'IKM Rayong (RY)',
    bio: 'Senior Site Manager with 14+ years of industrial asset management, plant turnaround, and offshore team coordination experience across Southeast Asia.',
    cv: {
      summary: 'Experienced Operations Manager specialized in high-pressure piping commissioning, plant shutdown management, and team safety leadership.',
      education: [
        'B.Eng. Mechanical Engineering - Chulalongkorn University (2012)',
        'M.Sc. Engineering Management - Asian Institute of Technology (2016)'
      ],
      experiences: [
        {
          period: '2020 - Present',
          position: 'Site Manager & Base Lead',
          company: 'IKM Operations Rayong Base',
          description: 'Directing on-site maintenance crews, client work requests, and budget allocations for Map Ta Phut industrial clients.'
        },
        {
          period: '2015 - 2020',
          position: 'Senior Commissioning Engineer',
          company: 'Offshore Energy Services Ltd.',
          description: 'Managed pipeline nitrogen flushing, hydrostatic testing, and hydro-milling operations.'
        }
      ],
      emergencyContact: {
        name: 'Wanna Suksan (Wife)',
        relation: 'Spouse',
        phone: '081-887-1122'
      }
    },
    certificates: [
      {
        id: 'CERT-001',
        name: 'BOSIET with Compressed Air EBS (Offshore Survival)',
        issuingBody: 'OPITO Certified Academy',
        certificateNo: 'OPITO-BOSIET-2024-9918',
        issueDate: '2024-03-15',
        expireDate: '2028-03-15', // Active
        pdfUrl: 'https://example.com/certs/bosiet-somchai.pdf',
        documentName: 'OPITO_BOSIET_Somchai_2024.pdf',
        notes: 'Standard offshore survival training including helicopter underwater escape.'
      },
      {
        id: 'CERT-002',
        name: 'NEBOSH International General Certificate in Occupational Health & Safety',
        issuingBody: 'NEBOSH UK',
        certificateNo: 'NEBOSH-IGC-882910',
        issueDate: '2022-06-10',
        expireDate: '2026-10-02', // Expiring in ~19 days (< 30 days alert!)
        pdfUrl: 'https://example.com/certs/nebosh-somchai.pdf',
        documentName: 'NEBOSH_IGC_Cert_Somchai.pdf',
        notes: 'Comprehensive HSE management systems and hazard risk appraisal.'
      },
      {
        id: 'CERT-003',
        name: 'ASME Section IX Welding & Pressure Vessel Inspector',
        issuingBody: 'American Society of Mechanical Engineers',
        certificateNo: 'ASME-IX-2023-4411',
        issueDate: '2023-01-20',
        expireDate: '2027-01-20',
        pdfUrl: 'https://example.com/certs/asme-somchai.pdf',
        documentName: 'ASME_Section_IX_Inspector_Cert.pdf',
        notes: 'Qualified for QA/QC inspection on high-pressure piping assemblies.'
      }
    ]
  },
  {
    id: 'emp-001-kittipong',
    name: 'Kittipong Mechai',
    username: 'kittipong.lead',
    password: 'password123',
    role: 'Lead Engineer',
    userLevel: 'Supervisor',
    department: 'Mechanical Engineering',
    avatarColor: '#F58220',
    avatarUrl: '',
    availability: 'available',
    utilization: 80,
    score: 92,
    skills: ['Piping', 'Welding', 'ASME Codes'],
    phone: '081-445-5667',
    email: 'kittipong.m@ikm-ops.com',
    baseLocation: 'IKM Rayong (RY)',
    bio: 'Lead Mechanical Engineer with deep expertise in high-pressure piping systems, ASME codes, and orbital TIG welding quality assurance.',
    cv: {
      summary: 'Mechanical Engineer with 9 years specializing in pre-commissioning, hydrostatic testing, and critical flange integrity.',
      education: [
        'B.Eng. Mechanical & Materials - KMUTT (2016)'
      ],
      experiences: [
        {
          period: '2021 - Present',
          position: 'Lead Mechanical Engineer',
          company: 'IKM Operations Base Rayong',
          description: 'Supervising field technician teams for flange management, nitrogen helium leak testing, and piping fabrication.'
        }
      ],
      emergencyContact: {
        name: 'Nipha Mechai (Mother)',
        relation: 'Parent',
        phone: '089-445-9988'
      }
    },
    certificates: [
      {
        id: 'CERT-004',
        name: 'ECITB Flange Joint Integrity & Bolting Level 3 (MJIT10/18/19)',
        issuingBody: 'Engineering Construction Industry Training Board',
        certificateNo: 'ECITB-FJI-2023-7721',
        issueDate: '2023-04-12',
        expireDate: '2027-04-12',
        documentName: 'ECITB_Flange_Joint_Integrity_L3.pdf',
        notes: 'Covers hydraulic bolt tensioning and torque tightening procedures.'
      },
      {
        id: 'CERT-005',
        name: 'CSWIP 3.1 Certified Visual Welding Inspector',
        issuingBody: 'TWI Certification Ltd',
        certificateNo: 'CSWIP-3.1-998234',
        issueDate: '2021-09-25',
        expireDate: '2026-09-28', // Expiring in ~15 days (< 30 days alert!)
        documentName: 'CSWIP_3.1_Welding_Inspector_Cert.pdf',
        notes: 'Weld joint visual inspection and defect characterization.'
      }
    ]
  },
  {
    id: 'emp-002-siriwan',
    name: 'Siriwan Prasert',
    username: 'siriwan.hse',
    password: 'password123',
    role: 'Safety Inspector',
    userLevel: 'Coordinator',
    department: 'Health, Safety & Environment (HSE)',
    avatarColor: '#16794B',
    avatarUrl: '',
    availability: 'busy',
    utilization: 95,
    score: 95,
    skills: ['HSE Audit', 'Permit to Work', 'Hazard Analysis'],
    phone: '089-223-3445',
    email: 'siriwan.p@ikm-ops.com',
    baseLocation: 'IKM Laem Chabang (LKU)',
    bio: 'HSE Safety Inspector certified in risk assessment, Job Safety Analysis (JSA), confined space entry rescue, and PTW systems.',
    cv: {
      summary: 'Certified Safety Professional with 8 years in chemical plant safety management and environmental compliance.',
      education: [
        'B.Sc. Occupational Health and Safety - Mahidol University (2017)'
      ],
      experiences: [
        {
          period: '2022 - Present',
          position: 'Senior HSE Officer & Coordinator',
          company: 'IKM Operations Base Laem Chabang',
          description: 'Enforcing site safety protocols, issuing Hot Work permits, and conducting pre-job toolbox talks.'
        }
      ],
      emergencyContact: {
        name: 'Prasert S. (Father)',
        relation: 'Parent',
        phone: '081-332-9900'
      }
    },
    certificates: [
      {
        id: 'CERT-006',
        name: 'Confined Space Entry, Gas Testing & Rescue Lead',
        issuingBody: 'National Safety Training Center',
        certificateNo: 'NSTC-CS-2024-1188',
        issueDate: '2024-05-18',
        expireDate: '2027-05-18',
        documentName: 'Confined_Space_Rescue_Lead_Cert.pdf',
        notes: 'Certified for multi-gas atmospheric monitoring and tripod hoist recovery.'
      },
      {
        id: 'CERT-007',
        name: 'Advanced Industrial First Aid & CPR/AED Instructor',
        issuingBody: 'Thai Red Cross & OSHA',
        certificateNo: 'TRC-AED-2023-5591',
        issueDate: '2023-11-01',
        expireDate: '2026-10-05', // Expiring in ~22 days (< 30 days alert!)
        documentName: 'FirstAid_CPR_AED_Instructor_2023.pdf',
        notes: 'Certified emergency medical response coordinator.'
      }
    ]
  },
  {
    id: 'emp-003-country',
    name: 'Art Kitthana',
    username: 'art.countrymgr',
    password: 'password123',
    role: 'Country Manager',
    userLevel: 'Country Manager',
    department: 'Management',
    avatarColor: '#10B981',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    availability: 'available',
    utilization: 70,
    score: 98,
    skills: ['Project Governance', 'Offshore Strategy', 'P&L Management', 'High-Level Approval'],
    phone: '089-112-3344',
    email: 'art.k@ikm-ops.com',
    baseLocation: 'IKM Rayong (RY)',
    bio: 'Country Operations Manager with oversight over Rayong Base, Laem Chabang Base, and Offshore Rig campaigns across Thailand.',
    cv: {
      summary: 'Country Manager with 18+ years leading multinational oil & gas pre-commissioning projects and multi-million dollar asset integrity contracts.',
      education: [
        'B.Eng. Petroleum & Mechanical Engineering - Imperial College London',
        'Executive MBA - Sasin School of Management'
      ],
      experiences: [
        {
          period: '2019 - Present',
          position: 'Country Manager & Operations Director',
          company: 'IKM Testing (Thailand) Co., Ltd.',
          description: 'Overall operational, fiscal, and regulatory responsibility for all onshore bases and offshore units in the Gulf of Thailand.'
        }
      ]
    },
    certificates: [
      {
        id: 'CERT-008',
        name: 'OPITO Major Emergency Management Initial Response (MEMIR)',
        issuingBody: 'OPITO International',
        certificateNo: 'MEMIR-2023-88901',
        issueDate: '2023-08-10',
        expireDate: '2027-08-10',
        documentName: 'OPITO_MEMIR_ArtKitthana.pdf',
        notes: 'Crisis command and incident management for offshore installations.'
      }
    ]
  },
  {
    id: 'emp-004-admin',
    name: 'Narin Vorapat',
    username: 'admin.narin',
    password: 'password123',
    role: 'System Administrator',
    userLevel: 'Admin',
    department: 'IT & Security',
    avatarColor: '#8B5CF6',
    avatarUrl: '',
    availability: 'available',
    utilization: 65,
    score: 99,
    skills: ['RBAC Security', 'Database Administration', 'Master Data Management'],
    phone: '086-778-9900',
    email: 'admin@ikm-ops.com',
    baseLocation: 'IKM Rayong (RY)',
    bio: 'System Administrator overseeing identity access management, Supabase database synchronization, and platform compliance.',
    certificates: [
      {
        id: 'CERT-009',
        name: 'CompTIA Security+ & ISO 27001 Lead Auditor',
        issuingBody: 'CompTIA & BSI Group',
        certificateNo: 'SEC-ISO-2024-4421',
        issueDate: '2024-02-14',
        expireDate: '2027-02-14',
        documentName: 'CompTIA_Security_LeadAuditor.pdf'
      }
    ]
  },
  {
    id: 'emp-005-tech',
    name: 'Anurak Techaporn',
    username: 'anurak.tech',
    password: 'password123',
    role: 'Senior Field Technician',
    userLevel: 'Technician',
    department: 'Field Services',
    avatarColor: '#3B82F6',
    avatarUrl: '',
    availability: 'available',
    utilization: 88,
    score: 89,
    skills: ['Torque & Tensioning', 'Flange Integrity', 'Hydrotest Execution'],
    phone: '083-456-7890',
    email: 'anurak.t@ikm-ops.com',
    baseLocation: 'IKM Rayong (RY)',
    bio: 'Hands-on mechanical technician specializing in on-site hydrotesting, bolt torqueing, and photographic task evidence reporting.',
    certificates: [
      {
        id: 'CERT-010',
        name: 'High Pressure Water Jetting & Hydrotest Safety',
        issuingBody: 'WJA Water Jetting Association',
        certificateNo: 'WJA-HT-2023-1120',
        issueDate: '2023-05-10',
        expireDate: '2027-05-10',
        documentName: 'Hydrotest_Safety_WJA_Anurak.pdf'
      }
    ]
  },
  {
    id: 'emp-006-req',
    name: 'Vichai Damrong',
    username: 'vichai.client',
    password: 'password123',
    role: 'Client Work Requester',
    userLevel: 'Requester',
    department: 'Client Asset Services',
    avatarColor: '#EC4899',
    avatarUrl: '',
    availability: 'available',
    utilization: 50,
    score: 90,
    skills: ['Work Requisitions', 'Site Acceptance', 'Inspection Scope'],
    phone: '087-654-3210',
    email: 'vichai.d@client-rep.com',
    baseLocation: 'IKM Laem Chabang (LKU)',
    bio: 'Client Site Representative responsible for creating maintenance work requests, tracking approvals, and verifying deliverables.'
  }
];
