// app/resume-builder/Template1.js
import React from 'react';

// ATS-friendly inline CSS for reliable PDF rendering
const styles = {
  container: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    padding: '32px',
    margin: '0 auto',
    maxWidth: '800px',
    background: '#ffffff',
    color: '#111827',
    lineHeight: '1.5',
  },
  accentBar: { height: '4px', background: '#2563eb', marginBottom: '20px', borderRadius: '2px' },
  header: { marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid #e5e7eb' },
  name: { fontSize: '28px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0', letterSpacing: '-0.5px' },
  title: { fontSize: '15px', color: '#374151', margin: '0 0 8px 0', fontWeight: '500' },
  contact: { fontSize: '11px', color: '#6b7280', display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '6px' },
  contactItem: { display: 'flex', alignItems: 'center', gap: '4px' },
  section: { marginBottom: '20px' },
  sectionTitle: {
    fontSize: '12px', fontWeight: '700', color: '#2563eb',
    textTransform: 'uppercase', letterSpacing: '1px',
    marginBottom: '10px', paddingBottom: '4px',
    borderBottom: '1px solid #e5e7eb',
  },
  summaryText: { fontSize: '13px', lineHeight: '1.6', color: '#374151', margin: '0' },
  jobBlock: { marginBottom: '14px' },
  jobHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' },
  jobTitle: { fontWeight: '700', fontSize: '14px', color: '#111827' },
  jobCompany: { fontWeight: '400', color: '#4b5563' },
  jobTime: { fontSize: '11px', color: '#6b7280', flexShrink: '0' },
  ul: { paddingLeft: '18px', margin: '4px 0 0 0' },
  listItem: { fontSize: '12px', lineHeight: '1.6', color: '#374151', marginBottom: '2px' },
  eduBlock: { marginBottom: '8px' },
  eduHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
  eduDegree: { fontWeight: '600', fontSize: '13px', color: '#111827' },
  eduInst: { fontWeight: '400', color: '#4b5563' },
  eduTime: { fontSize: '11px', color: '#6b7280' },
  skillCategory: { marginBottom: '8px' },
  skillLabel: { fontSize: '11px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' },
  skillTags: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  skillTag: { display: 'inline-block', background: '#eff6ff', color: '#1d4ed8', padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '500' },
};

const Template1 = ({ data }) => {
  const { basicInfo, summary, experience, education, skills } = data;

  return (
    <div style={styles.container}>
      <div style={styles.accentBar} />

      {/* HEADER */}
      <header style={styles.header}>
        <h1 style={styles.name}>{basicInfo?.name || 'Your Name'}</h1>
        <h2 style={styles.title}>{basicInfo?.title || 'Professional Title'}</h2>
        <div style={styles.contact}>
          {basicInfo?.email && <span style={styles.contactItem}>✉ {basicInfo.email}</span>}
          {basicInfo?.phone && <span style={styles.contactItem}>☎ {basicInfo.phone}</span>}
          {basicInfo?.linkedin && <span style={styles.contactItem}>🔗 {basicInfo.linkedin}</span>}
          {basicInfo?.location && <span style={styles.contactItem}>📍 {basicInfo.location}</span>}
        </div>
      </header>

      {/* SUMMARY */}
      {summary && (
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Professional Summary</h3>
          <p style={styles.summaryText}>{summary}</p>
        </section>
      )}

      {/* EXPERIENCE */}
      {experience && experience.length > 0 && (
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Professional Experience</h3>
          {experience.map((job, index) => (
            <div key={index} style={styles.jobBlock}>
              <div style={styles.jobHeader}>
                <div>
                  <span style={styles.jobTitle}>{job.title}</span>
                  <span style={styles.jobCompany}> — {job.company}</span>
                </div>
                <span style={styles.jobTime}>
                  {job.startDate || ''} {job.endDate ? `– ${job.endDate}` : ''}
                </span>
              </div>
              {job.description && job.description.filter(d => d && d.trim()).length > 0 && (
                <ul style={styles.ul}>
                  {job.description.filter(d => d && d.trim()).map((desc, i) => (
                    <li key={i} style={styles.listItem}>{desc}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* EDUCATION */}
      {education && education.length > 0 && (
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Education</h3>
          {education.map((edu, index) => (
            <div key={index} style={styles.eduBlock}>
              <div style={styles.eduHeader}>
                <div>
                  <span style={styles.eduDegree}>{edu.degree}</span>
                  <span style={styles.eduInst}> — {edu.institution}</span>
                </div>
                <span style={styles.eduTime}>
                  {edu.startDate || ''} {edu.endDate ? `– ${edu.endDate}` : ''}
                </span>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* SKILLS */}
      {skills && (
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Technical Skills</h3>
          {skills.languages && (
            <div style={styles.skillCategory}>
              <div style={styles.skillLabel}>Languages</div>
              <div style={styles.skillTags}>
                {skills.languages.split(',').map(s => s.trim()).filter(Boolean).map((t, i) => (
                  <span key={i} style={styles.skillTag}>{t}</span>
                ))}
              </div>
            </div>
          )}
          {skills.frameworks && (
            <div style={styles.skillCategory}>
              <div style={styles.skillLabel}>Frameworks & Libraries</div>
              <div style={styles.skillTags}>
                {skills.frameworks.split(',').map(s => s.trim()).filter(Boolean).map((t, i) => (
                  <span key={`f-${i}`} style={styles.skillTag}>{t}</span>
                ))}
              </div>
            </div>
          )}
          {skills.databases && (
            <div style={styles.skillCategory}>
              <div style={styles.skillLabel}>Databases & Tools</div>
              <div style={styles.skillTags}>
                {skills.databases.split(',').map(s => s.trim()).filter(Boolean).map((t, i) => (
                  <span key={`d-${i}`} style={styles.skillTag}>{t}</span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Template1;