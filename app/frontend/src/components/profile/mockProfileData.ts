export const mockProfile = {
  avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
  name: 'John Doe',
  title: 'Senior Software Engineer',
  location: 'San Francisco, CA',
  socialLinks: [
    { label: 'LinkedIn', url: 'https://linkedin.com/in/johndoe' },
    { label: 'GitHub', url: 'https://github.com/johndoe' },
    { label: 'Twitter', url: 'https://twitter.com/johndoe' },
  ],
  bio: `Experienced software engineer with a passion for building scalable web applications and working with modern JavaScript frameworks.`,
  skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
  experiences: [
    {
      id: 1,
      title: 'Senior Software Engineer',
      company: 'TechCorp',
      start_date: '2019-01',
      end_date: '',
      description: 'Leading a team of 5 engineers to build cloud-native applications.'
    },
    {
      id: 2,
      title: 'Frontend Developer',
      company: 'Webify',
      start_date: '2016-06',
      end_date: '2018-12',
      description: 'Developed and maintained the company website and internal tools.'
    }
  ],
  educations: [
    {
      id: 1,
      school: 'Stanford University',
      degree: 'B.Sc.',
      field: 'Computer Science',
      start_date: '2012',
      end_date: '2016'
    }
  ],
  contact: {
    email: 'john.doe@example.com',
    phone: '+1 555-123-4567'
  },
  activity: [
    { id: 1, type: 'post', content: 'Published a new article on React best practices.', date: '2024-06-01T10:00:00Z' },
    { id: 2, type: 'like', content: 'Liked a post about TypeScript tips.', date: '2024-05-28T14:30:00Z' },
    { id: 3, type: 'comment', content: 'Commented on a discussion about GraphQL.', date: '2024-05-25T09:15:00Z' },
    { id: 4, type: 'connection', content: 'Connected with Jane Smith.', date: '2024-05-20T16:45:00Z' },
    { id: 5, type: 'post', content: 'Shared a project on GitHub.', date: '2024-05-18T11:20:00Z' },
    { id: 6, type: 'post', content: 'Presented at a local JS meetup.', date: '2024-05-10T18:00:00Z' },
  ] as (
    { id: number; type: 'post' | 'like' | 'comment' | 'connection'; content: string; date: string; }
  )[],
  connectionCount: 350,
  mutualConnections: ['Jane Smith', 'Bob Lee', 'Alice Johnson']
}; 