export const sampleCVs = {
  basic: `NOAM NAUMOVSKY
Tel Aviv, Israel | +972 52 6784960 | noamnau@gmail.com

PROFESSIONAL SUMMARY
Senior Motion Designer with 10+ years of experience in post-production and gaming.

TECHNICAL SKILLS
Motion Graphics: Adobe After Effects
Video Editing: Adobe Premiere Pro, DaVinci Resolve
Graphic Design: Adobe Photoshop, Adobe Illustrator
3D Modeling: Blender`,

  withSpecialCharacters: `NOAM NAUMOVSKY
Tel Aviv, Israel | +972 52-6784960 | noamnau@gmail.com

TECHNICAL SKILLS
• Motion Graphics: Adobe After Effects
• Video Editing: Adobe Premiere Pro
• 3D Modeling: Blender`,

  withComplexDates: `PROFESSIONAL EXPERIENCE
Noam Naumovsky Productions Tel Aviv, Israel • 1/2012 - Present
Senior Motion Designer
• Managed multiple projects
• Led team initiatives

Previous Role Tel Aviv, Israel • 06/2010 - 12/2011
Junior Designer
• Assisted with projects`,

  withLongBulletPoints: `PROFESSIONAL EXPERIENCE
Senior Designer Tel Aviv, Israel
• Managed and coordinated multiple high-priority projects simultaneously while maintaining strict attention to detail and ensuring all deliverables met quality standards and were completed within established timelines
• Developed and implemented comprehensive design strategies that significantly improved workflow efficiency and reduced project completion time by 25% while maintaining exceptional quality standards
• Collaborated extensively with cross-functional teams to create innovative solutions for complex design challenges, resulting in successful project outcomes and positive client feedback`,

  withSpecialFormatting: `NOAM NAUMOVSKY
Tel Aviv, Israel | noamnau@gmail.com | Portfolio: www.noam.design

PROFESSIONAL EXPERIENCE
Senior Motion Designer, Creative Content Producer Tel Aviv, Israel • 2012 - Present
Lead Video Editor & VFX Artist
• Project Management
• Team Leadership`,
};

export const expectedResults = {
  basic: {
    sections: 4,  // Header, Summary, Skills
    bulletPoints: 0,
    hasSpecialCharacters: false,
  },
  withSpecialCharacters: {
    sections: 2,  // Header, Skills
    bulletPoints: 3,
    hasSpecialCharacters: true,
  },
  withComplexDates: {
    sections: 1,  // Experience
    bulletPoints: 4,
    hasDates: true,
  },
  withLongBulletPoints: {
    sections: 1,  // Experience
    bulletPoints: 3,
    maxBulletLength: 200,
  },
  withSpecialFormatting: {
    sections: 2,  // Header, Experience
    bulletPoints: 2,
    hasMultilineTitle: true,
  },
};
