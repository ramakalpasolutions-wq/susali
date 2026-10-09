const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting SUSALI Database Seeding...");

  console.log("🧹 Cleaning old records...");
  await prisma.auditLog.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.document.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.investigationReport.deleteMany();
  await prisma.investigation.deleteMany();
  await prisma.consultation.deleteMany();
  await prisma.hospitalVisit.deleteMany();
  await prisma.appointmentHistory.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.hospitalDepartment.deleteMany();
  await prisma.hospital.deleteMany();
  await prisma.user.deleteMany();
  await prisma.area.deleteMany();

  const hashedPassword = await bcrypt.hash("admin123", 10);
  const staffPassword = await bcrypt.hash("password123", 10);

  console.log("📍 Creating Areas...");
  const areaNorth = await prisma.area.create({
    data: {
      name: "North Mining Zone (Godavarikhani)",
      code: "NMZ-01",
      state: "Telangana",
      district: "Peddapalli",
    },
  });

  const areaSouth = await prisma.area.create({
    data: {
      name: "South Coal Belt (Kothagudem)",
      code: "SCB-02",
      state: "Telangana",
      district: "Bhadradri Kothagudem",
    },
  });

  const areaCentral = await prisma.area.create({
    data: {
      name: "Central Industrial Area (Ramagundam)",
      code: "CIA-03",
      state: "Telangana",
      district: "Peddapalli",
    },
  });

  console.log("🏢 Creating Hospitals...");
  const apolloHospital = await prisma.hospital.create({
    data: {
      name: "Apollo Multi-Specialty Hospital",
      code: "HOSP-APOLLO",
      address: "Road No. 72, Jubilee Hills",
      city: "Hyderabad",
      state: "Telangana",
      pinCode: "500033",
      phone: "+91 98490 11223",
      email: "referrals@apollohyderabad.com",
    },
  });

  const yashodaHospital = await prisma.hospital.create({
    data: {
      name: "Yashoda Super Specialty Hospital",
      code: "HOSP-YASHODA",
      address: "Raj Bhavan Road, Somajiguda",
      city: "Hyderabad",
      state: "Telangana",
      pinCode: "500082",
      phone: "+91 98491 22334",
      email: "corporate@yashodamail.com",
    },
  });

  console.log("🩺 Creating Hospital Departments...");
  const deptApolloPulmo = await prisma.hospitalDepartment.create({
    data: {
      hospitalId: apolloHospital.id,
      name: "Pulmonology & Chest Medicine",
    },
  });

  const deptApolloCardio = await prisma.hospitalDepartment.create({
    data: {
      hospitalId: apolloHospital.id,
      name: "Cardiology & Cardiac Surgery",
    },
  });

  const deptApolloOrtho = await prisma.hospitalDepartment.create({
    data: {
      hospitalId: apolloHospital.id,
      name: "Orthopedics & Spine Surgery",
    },
  });

  const deptYashodaPulmo = await prisma.hospitalDepartment.create({
    data: {
      hospitalId: yashodaHospital.id,
      name: "Pulmonology & Respiratory Care",
    },
  });

  const deptYashodaGastro = await prisma.hospitalDepartment.create({
    data: {
      hospitalId: yashodaHospital.id,
      name: "Gastroenterology & Hepatology",
    },
  });

  console.log("👨‍⚕️ Creating Doctors...");
  const docApolloPulmo = await prisma.doctor.create({
    data: {
      hospitalId: apolloHospital.id,
      departmentId: deptApolloPulmo.id,
      name: "Dr. Alok Sharma",
      specialization: "Senior Interventional Pulmonologist",
      phone: "+91 98495 10101",
      email: "dr.sharma@apollo.com",
    },
  });

  const docApolloCardio = await prisma.doctor.create({
    data: {
      hospitalId: apolloHospital.id,
      departmentId: deptApolloCardio.id,
      name: "Dr. Ramanatha Rao",
      specialization: "Chief Interventional Cardiologist",
      phone: "+91 98495 20202",
      email: "dr.rao@apollo.com",
    },
  });

  console.log("👥 Creating System Users (5 Roles)...");
  
  // 1. Super Admin
  const userAdmin = await prisma.user.create({
    data: {
      name: "System Super Admin",
      email: "admin@susali.in",
      password: hashedPassword,
      phone: "+91 90000 00001",
      role: "SUPER_ADMIN",
    },
  });

  // 2. Sudo Admin
  const userSudo = await prisma.user.create({
    data: {
      name: "System Sudo Admin",
      email: "sudo@susali.in",
      password: hashedPassword,
      phone: "+91 90000 00010",
      role: "SUDO_ADMIN",
    },
  });

  // 3. Support Team (Primary intake)
  const userSupport = await prisma.user.create({
    data: {
      name: "Central Support Intake",
      email: "support@susali.in",
      password: staffPassword,
      phone: "+91 90000 00006",
      role: "SUPPORT",
    },
  });

  // 4. Area Managers
  const userAMNorth = await prisma.user.create({
    data: {
      name: "Mahesh Kumar Goud",
      email: "areamanager.north@susali.in",
      password: staffPassword,
      phone: "+91 90000 00004",
      role: "AREA_MANAGER",
      areaId: areaNorth.id,
    },
  });

  const userAMSouth = await prisma.user.create({
    data: {
      name: "Chandra Mohan Reddy",
      email: "areamanager.south@susali.in",
      password: staffPassword,
      phone: "+91 90000 00005",
      role: "AREA_MANAGER",
      areaId: areaSouth.id,
    },
  });

  // 5. Hospital Users
  const userHospApollo = await prisma.user.create({
    data: {
      name: "Apollo Helpdesk Coordinator",
      email: "hospital.apollo@susali.in",
      password: staffPassword,
      phone: "+91 90000 00007",
      role: "HOSPITAL",
      hospitalId: apolloHospital.id,
    },
  });

  const userHospYashoda = await prisma.user.create({
    data: {
      name: "Yashoda Helpdesk Coordinator",
      email: "hospital.yashoda@susali.in",
      password: staffPassword,
      phone: "+91 90000 00008",
      role: "HOSPITAL",
      hospitalId: yashodaHospital.id,
    },
  });

  console.log("🧑‍🦽 Creating Patients (Assigned directly to Areas)...");
  const patRajesh = await prisma.patient.create({
    data: {
      patientId: "PAT-2026-000001",
      fullName: "Rajesh Kumar Mandal",
      age: 49,
      gender: "MALE",
      dateOfBirth: new Date("1977-04-12"),
      mobile: "9848012345",
      alternateMobile: "9848054321",
      beneficiaryId: "EMP-SCCL-84729",
      areaId: areaNorth.id,
      address: "Quarter No. B-42, RG-2 Mining Colony",
      village: "Godavarikhani",
      mandal: "Ramagundam",
      district: "Peddapalli",
      state: "Telangana",
      pinCode: "505209",
      emergencyContact: "Sunita Mandal (Wife)",
      emergencyRelation: "SPOUSE",
      emergencyMobile: "9848099887",
      createdByUserId: userSupport.id,
    },
  });

  const patLakshmi = await prisma.patient.create({
    data: {
      patientId: "PAT-2026-000002",
      fullName: "Lakshmi Devi Mandal",
      age: 54,
      gender: "FEMALE",
      dateOfBirth: new Date("1972-08-20"),
      mobile: "9876543210",
      beneficiaryId: "DEP-SCCL-84729-01",
      areaId: areaNorth.id,
      address: "Quarter No. B-42, RG-2 Mining Colony",
      village: "Godavarikhani",
      mandal: "Ramagundam",
      district: "Peddapalli",
      state: "Telangana",
      pinCode: "505209",
      emergencyContact: "Rajesh Kumar Mandal",
      emergencyRelation: "SPOUSE",
      emergencyMobile: "9848012345",
      createdByUserId: userSupport.id,
    },
  });

  const patRamesh = await prisma.patient.create({
    data: {
      patientId: "PAT-2026-000003",
      fullName: "Ramesh Babu V.",
      age: 38,
      gender: "MALE",
      dateOfBirth: new Date("1988-11-05"),
      mobile: "9440122334",
      beneficiaryId: "EMP-SCCL-92100",
      areaId: areaSouth.id,
      address: "Plot 18, Venkateshwara Colony",
      village: "Rudrampur",
      mandal: "Kothagudem",
      district: "Bhadradri Kothagudem",
      state: "Telangana",
      pinCode: "507101",
      emergencyContact: "V. Padmavathi",
      emergencyRelation: "SPOUSE",
      emergencyMobile: "9440199881",
      createdByUserId: userSupport.id,
    },
  });

  console.log("📋 Creating Journey 1: Rajesh Kumar...");
  const ref1 = await prisma.referral.create({
    data: {
      referralId: "REF-2026-000501",
      patientId: patRajesh.id,
      hospitalId: apolloHospital.id,
      departmentId: deptApolloPulmo.id,
      createdById: userSupport.id,
      assignedToId: userAMNorth.id,
      status: "DOCTOR_REVIEW_PENDING",
      priority: "URGENT",
      reason: "Suspected Coal Workers' Pneumoconiosis with chronic dyspnea and cough",
      notes: "Heavy dust exposure for 22 years. Oxygen saturation drops on exertion.",
      referredAt: new Date(Date.now() - 7 * 86400000),
      appointmentDate: new Date(Date.now() - 5 * 86400000),
    },
  });

  await prisma.appointment.create({
    data: {
      referralId: ref1.id,
      hospitalId: apolloHospital.id,
      departmentId: deptApolloPulmo.id,
      doctorId: docApolloPulmo.id,
      patientId: patRajesh.id,
      appointmentDate: new Date(Date.now() - 5 * 86400000),
      appointmentTime: "10:30 AM",
      status: "COMPLETED",
      notes: "Confirmed by Apollo Helpdesk.",
      createdById: userAMNorth.id,
    },
  });

  const visit1 = await prisma.hospitalVisit.create({
    data: {
      referralId: ref1.id,
      hospitalId: apolloHospital.id,
      patientId: patRajesh.id,
      visitType: "INITIAL",
      checkedInAt: new Date(Date.now() - 5 * 86400000 + 3600000 * 10),
      checkedInBy: userHospApollo.name,
      status: "CHECKED_IN",
    },
  });

  const consult1 = await prisma.consultation.create({
    data: {
      visitId: visit1.id,
      referralId: ref1.id,
      patientId: patRajesh.id,
      doctorId: docApolloPulmo.id,
      department: "Pulmonology",
      symptoms: "Severe productive cough, nocturnal wheezing, exercise tolerance < 100m.",
      clinicalNotes: "Bilateral rhonchi and basal crepitations. SpO2 90% resting, drops to 84% on exertion.",
      diagnosis: "Complicated Coal Workers' Pneumoconiosis (PMF Stage II). Rule out active Koch's.",
      doctorAdvice: "Urgent HRCT Thorax, Spirometry with PFT, sputum AFB panel.",
      investigationRequired: true,
      prescriptionProvided: true,
      followUpRequired: true,
      startTime: new Date(Date.now() - 5 * 86400000 + 3600000 * 11),
      endTime: new Date(Date.now() - 5 * 86400000 + 3600000 * 11 + 1800000),
    },
  });

  const inv1 = await prisma.investigation.create({
    data: {
      investigationId: "INV-2026-001251",
      consultationId: consult1.id,
      referralId: ref1.id,
      patientId: patRajesh.id,
      doctorId: docApolloPulmo.id,
      type: "SCAN",
      name: "High Resolution CT Thorax (HRCT 128-Slice)",
      status: "REPORT_UPLOADED",
      requestedAt: new Date(Date.now() - 5 * 86400000),
      scheduledAt: new Date(Date.now() - 4 * 86400000),
      completedAt: new Date(Date.now() - 4 * 86400000 + 7200000),
    },
  });

  await prisma.investigationReport.create({
    data: {
      investigationId: inv1.id,
      patientId: patRajesh.id,
      referralId: ref1.id,
      reportType: "RADIOLOGY",
      reportDate: new Date(Date.now() - 4 * 86400000),
      fileUrl: "https://r2.susali.in/reports/INV-2026-001251-hrct.pdf",
      fileName: "HRCT_Thorax_Report_RajeshMandal.pdf",
      fileSize: 2450000,
      mimeType: "application/pdf",
      remarks: "Bilateral upper lobe conglomerate progressive massive fibrosis with architectural distortion.",
      doctorReviewed: true,
      reviewedById: userHospApollo.id,
      reviewedAt: new Date(Date.now() - 2 * 86400000),
      uploadedById: userHospApollo.id,
      uploadedAt: new Date(Date.now() - 3 * 86400000),
    },
  });

  await prisma.prescription.create({
    data: {
      consultationId: consult1.id,
      referralId: ref1.id,
      patientId: patRajesh.id,
      doctorId: docApolloPulmo.id,
      hospitalId: apolloHospital.id,
      type: "INTERIM",
      diagnosis: "Coal Workers' Pneumoconiosis with severe airflow obstruction",
      notes: "Inhaler Foracort 400 (1 puff BD), Inhaler Tiova (1 puff OD), Tab N-Acetylcysteine 600mg (1 tab BD). Strict dust avoidance.",
      uploadedById: userHospApollo.id,
    },
  });

  console.log("📝 Generating Activity Logs...");
  await prisma.activityLog.create({
    data: {
      referralId: ref1.id,
      patientId: patRajesh.id,
      userId: userSupport.id,
      userName: userSupport.name,
      userRole: "SUPPORT",
      action: "REFERRAL_CREATED",
      description: "Urgent referral created for Rajesh Kumar Mandal to Apollo Pulmonology.",
    },
  });

  console.log("🔒 Generating System Audit Logs...");
  await prisma.auditLog.create({
    data: {
      userId: userAdmin.id,
      userName: userAdmin.name,
      userRole: "SUPER_ADMIN",
      action: "SYSTEM_INITIALIZATION",
      entityType: "System",
      entityId: "SYSTEM_INIT",
      newValue: { version: "2.0.0", environment: "Production", activeRoles: 5 },
      ipAddress: "127.0.0.1",
    },
  });

  console.log("\n=======================================================");
  console.log("✅ SEEDING COMPLETE! SUSALI DATABASE RUNS ON 5 ROLES.");
  console.log("=======================================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });