// app/resume-builder/Template1.js
import React from 'react';

// Using inline CSS for reliable PDF rendering
const styles = {
  container: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    padding: '28px',
    margin: '0 auto',
    maxWidth: '800px',
    background: '#ffffff',
    color: '#111827'
  },
  accentBar: { height: '6px', background: '#4f46e5', marginBottom: '18px', borderRadius: '3px' },
  header: { marginBottom: '18px', paddingBottom: '8px', borderBottom: '1px solid #e6e9ee' },
  name: { fontSize: '30px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px 0' },
  title: { fontSize: '15px', color: '#374151', margin: '0 0 8px 0' },
  contact: { fontSize: '12px', color: '#6b7280', display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '6px' },
  twoCol: { display: 'flex', gap: '20px' },
  leftCol: { flex: '2' },
  rightCol: { flex: '1', paddingLeft: '12px', borderLeft: '1px solid #f1f5f9' },
  section: { marginBottom: '18px' },
  sectionTitle: { fontSize: '13px', fontWeight: '700', color: '#4f46e5', marginBottom: '8px' },
  listItem: { fontSize: '13px', lineHeight: '1.5', margin: '6px 0' },
  jobTitle: { fontWeight: '700', display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' },
  jobTime: { fontSize: '12px', color: '#6b7280' },
  ul: { paddingLeft: '18px', margin: '0' },
  skillTag: { display: 'inline-block', background: '#eef2ff', color: '#3730a3', padding: '4px 8px', borderRadius: '999px', fontSize: '12px', margin: '4px 6px 4px 0' }
};

const renderList = (items) => (
    <ul style={styles.ul}>
      {items && items.map((item, index) => <li key={index} style={styles.listItem}>{item}</li>)}
    </ul>
);

const Template1 = ({ data }) => {
  const { basicInfo, summary, experience, education, skills } = data;
  
  return (
    <div style={styles.container}>
      <div style={styles.accentBar} />
      {/* HEADER / BASIC INFO */}
      <header style={styles.header}>
        <h1 style={styles.name}>{basicInfo?.name || 'Your Name'}</h1>
        <h2 style={styles.title}>{basicInfo?.title || 'Professional Title'}</h2>
        <div style={styles.contact}>
            {basicInfo?.phone && <span>{basicInfo.phone}</span>}
            {basicInfo?.email && <span>{basicInfo.email}</span>}
            {basicInfo?.linkedin && <span>{basicInfo.linkedin}</span>}
            {basicInfo?.location && <span>{basicInfo.location}</span>}
        </div>
      </header>
      
      {/* Two-column layout: main content + sidebar */}
      <div style={styles.twoCol}>
        <div style={styles.leftCol}>
          {/* SUMMARY */}
          {summary && (
            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>SUMMARY</h3>
              <p style={styles.listItem}>{summary}</p>
            </section>
          )}

          {/* EXPERIENCE (Renders only if entries exist) */}
          {(experience && experience.length > 0) && (
            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>PROFESSIONAL EXPERIENCE</h3>
              {experience.map((job, index) => (
                <div key={index} style={{ marginBottom: '12px' }}>
                  <div style={styles.jobTitle}>
                    <span>{job.title} — {job.company}</span>
                    <span style={styles.jobTime}>{job.startDate || ''} {job.endDate ? `— ${job.endDate}` : ''}</span>
                  </div>
                  {/* Filter out empty bullet points */}
                  {renderList((job.description || []).filter(desc => desc && desc.trim()))} 
                </div>
              ))}
            </section>
          )}

          {/* EDUCATION */}
          {(education && education.length > 0) && (
            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>EDUCATION</h3>
              {education.map((edu, index) => (
                <div key={index} style={{ marginBottom: '8px', fontSize: '13px' }}>
                  <div style={styles.jobTitle}>
                    <span>{edu.degree} — {edu.institution}</span>
                    <span style={styles.jobTime}>{edu.startDate || ''} {edu.endDate ? `— ${edu.endDate}` : ''}</span>
                  </div>
                </div>
              ))}
            </section>
          )}
        </div>

        <aside style={styles.rightCol}>
          {/* SKILLS */}
          {(skills) && (
            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>TECHNICAL SKILLS</h3>
              <div>
                {(skills.languages || '').split(',').map((s, i) => s.trim()).filter(Boolean).map((t, i) => (
                  <span key={i} style={styles.skillTag}>{t}</span>
                ))}
              </div>

              <div style={{ marginTop: '8px' }}>
                {(skills.frameworks || '').split(',').map(s => s.trim()).filter(Boolean).map((t, i) => (
                  <span key={`f-${i}`} style={styles.skillTag}>{t}</span>
                ))}
              </div>
              <div style={{ marginTop: '8px' }}>
                {(skills.databases || '').split(',').map(s => s.trim()).filter(Boolean).map((t, i) => (
                  <span key={`d-${i}`} style={styles.skillTag}>{t}</span>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>

      {/* EXPERIENCE (Renders only if entries exist) */}
      {(experience && experience.length > 0) && (
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>PROFESSIONAL EXPERIENCE</h3>
          {experience.map((job, index) => (
            <div key={index} style={{ marginBottom: '15px' }}>
              <div style={styles.jobTitle}>
                <span>{job.title} at {job.company}</span>
                <span style={styles.jobTime}>{job.startDate} - {job.endDate}</span>
              </div>
              {/* Filter out empty bullet points */}
              {renderList(job.description.filter(desc => desc))} 
            </div>
          ))}
        </section>
      )}

      {/* EDUCATION */}
      {(education && education.length > 0) && (
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>EDUCATION</h3>
          {education.map((edu, index) => (
            <div key={index} style={{ marginBottom: '5px', fontSize: '13px' }}>
              <div style={styles.jobTitle}>
                <span>{edu.degree} - {edu.institution}</span>
                <span style={styles.jobTime}>{edu.startDate} - {edu.endDate}</span>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Final spacing (footer area) */}
      
    </div>
  );
};
export default Template1;