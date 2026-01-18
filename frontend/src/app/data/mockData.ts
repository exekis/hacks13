export interface User {
  id: string;
  name: string;
  avatar?: string; // url to profile picture, undefined shows initials
  bio: string;
  culturalBackground: string[];
  languages: string[];
  goals: string[];
  pronouns?: string;
  verified: {
    student: boolean;
    age: boolean;
  };
  location: string;
  mutualFriends?: number;
  badges: string[];
  photos: string[];
  university?: string;
  occupation?: string; // added for working professionals
}

// helper to generate initials from a name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// helper to get avatar url or undefined (for initials fallback)
export function getAvatarUrl(user: { avatar?: string; name: string }): string | undefined {
  return user.avatar;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  image?: string;
  dateRange: { from: string; to: string };
  timeRange: { from: string; to: string };
  location: string;
  timestamp: string;
  capacity: number;
}

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    bio: 'Looking to explore Toronto and make friends who love good food!',
    culturalBackground: ['Indian', 'South Asian'],
    languages: ['English', 'Hindi', 'Punjabi'],
    goals: ['Friends', 'Food buddies', 'Exploring the city'],
    pronouns: 'she/her',
    verified: { student: true, age: true },
    location: 'Toronto, ON',
    mutualFriends: 3,
    badges: ['Verified Student', 'Early Traveller', 'Food Explorer'],
    photos: ['photo1', 'photo2', 'photo3'],
    university: 'University of Toronto'
  },
  {
    id: '2',
    name: 'Marcus Chen',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    bio: 'CS student from Taiwan. Down for study sessions and late-night bubble tea runs!',
    culturalBackground: ['Taiwanese', 'East Asian'],
    languages: ['English', 'Mandarin'],
    goals: ['Study pals', 'Food buddies', 'Friends'],
    pronouns: 'he/him',
    verified: { student: true, age: true },
    location: 'Vancouver, BC',
    mutualFriends: 1,
    badges: ['Verified Student', 'Study Buddy', 'Bubble Tea Expert'],
    photos: ['photo1', 'photo2'],
    university: 'UBC'
  },
  {
    id: '3',
    name: 'Fatima Al-Rashid',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    bio: 'New to Montreal! Love coffee shops, art galleries, and deep conversations.',
    culturalBackground: ['Arab', 'Middle Eastern'],
    languages: ['English', 'Arabic', 'French'],
    goals: ['Friends', 'Exploring the city', 'Events'],
    pronouns: 'she/her',
    verified: { student: true, age: true },
    location: 'Montreal, QC',
    badges: ['Verified Student', 'Art Lover', 'Language Buddy'],
    photos: ['photo1', 'photo2', 'photo3', 'photo4'],
    university: 'McGill University'
  },
  {
    id: '4',
    name: 'Diego Santos',
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    bio: 'Brazilian exchange student looking for gym buddies and weekend adventures!',
    culturalBackground: ['Brazilian', 'Latin American'],
    languages: ['Portuguese', 'English', 'Spanish'],
    goals: ['Gym', 'Friends', 'Exploring the city'],
    pronouns: 'he/him',
    verified: { student: true, age: true },
    location: 'Toronto, ON',
    mutualFriends: 2,
    badges: ['Verified Student', 'Fitness Enthusiast', 'Adventure Seeker'],
    photos: ['photo1', 'photo2', 'photo3'],
    university: 'Ryerson University'
  },
  {
    id: '5',
    name: 'Amara Okonkwo',
    avatar: 'https://randomuser.me/api/portraits/women/90.jpg',
    bio: 'Nigerian grad student. Always up for trying new restaurants and cultural events.',
    culturalBackground: ['Nigerian', 'West African'],
    languages: ['English', 'Igbo', 'Yoruba'],
    goals: ['Friends', 'Food buddies', 'Events'],
    pronouns: 'she/her',
    verified: { student: true, age: true },
    location: 'Ottawa, ON',
    badges: ['Verified Student', 'Food Explorer', 'Cultural Ambassador'],
    photos: ['photo1', 'photo2'],
    university: 'Carleton University'
  },
  {
    id: '6',
    name: 'Yuki Tanaka',
    avatar: 'https://randomuser.me/api/portraits/women/79.jpg',
    bio: 'Japanese exchange student. Lets grab ramen and explore hidden spots!',
    culturalBackground: ['Japanese', 'East Asian'],
    languages: ['Japanese', 'English'],
    goals: ['Friends', 'Food buddies', 'Exploring the city'],
    pronouns: 'she/her',
    verified: { student: true, age: true },
    location: 'Vancouver, BC',
    mutualFriends: 1,
    badges: ['Verified Student', 'Ramen Expert', 'Explorer'],
    photos: ['photo1', 'photo2', 'photo3'],
    university: 'SFU'
  },
  {
    id: '7',
    name: 'Alex Kim',
    // no avatar - will show initials
    bio: 'Korean-Canadian looking for roommates and people to share apartment hunting tips.',
    culturalBackground: ['Korean', 'East Asian'],
    languages: ['English', 'Korean'],
    goals: ['Roommates', 'Friends', 'Study pals'],
    pronouns: 'they/them',
    verified: { student: true, age: true },
    location: 'Toronto, ON',
    badges: ['Verified Student', 'Housing Helper'],
    photos: ['photo1'],
    university: 'York University'
  },
  {
    id: '8',
    name: 'Sofia Martinez',
    avatar: 'https://randomuser.me/api/portraits/women/63.jpg',
    bio: 'Mexican student passionate about dance, music, and making new connections!',
    culturalBackground: ['Mexican', 'Latin American'],
    languages: ['Spanish', 'English'],
    goals: ['Friends', 'Events', 'Exploring the city'],
    pronouns: 'she/her',
    verified: { student: true, age: true },
    location: 'Montreal, QC',
    mutualFriends: 4,
    badges: ['Verified Student', 'Dance Enthusiast', 'Music Lover'],
    photos: ['photo1', 'photo2', 'photo3', 'photo4'],
    university: 'Concordia University'
  },
  {
    id: '9',
    name: 'Hassan Javed',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    bio: 'Pakistani engineer. Coffee addict looking for study groups and cricket fans.',
    culturalBackground: ['Pakistani', 'South Asian'],
    languages: ['English', 'Urdu', 'Punjabi'],
    goals: ['Study pals', 'Friends', 'Events'],
    pronouns: 'he/him',
    verified: { student: true, age: true },
    location: 'Calgary, AB',
    badges: ['Verified Student', 'Study Buddy', 'Cricket Fan'],
    photos: ['photo1', 'photo2'],
    university: 'University of Calgary'
  },
  {
    id: '10',
    name: 'Linh Nguyen',
    avatar: 'https://randomuser.me/api/portraits/women/51.jpg',
    bio: 'Vietnamese student new to Canada. Would love to find cooking partners!',
    culturalBackground: ['Vietnamese', 'Southeast Asian'],
    languages: ['Vietnamese', 'English'],
    goals: ['Friends', 'Food buddies', 'Exploring the city'],
    pronouns: 'she/her',
    verified: { student: true, age: true },
    location: 'Toronto, ON',
    mutualFriends: 2,
    badges: ['Verified Student', 'Cooking Enthusiast'],
    photos: ['photo1', 'photo2', 'photo3'],
    university: 'University of Toronto'
  },
  {
    id: '11',
    name: 'Ibrahim Diallo',
    avatar: 'https://randomuser.me/api/portraits/men/81.jpg',
    bio: 'Senegalese student passionate about tech and basketball. Lets connect!',
    culturalBackground: ['Senegalese', 'West African'],
    languages: ['French', 'English', 'Wolof'],
    goals: ['Friends', 'Gym', 'Study pals'],
    pronouns: 'he/him',
    verified: { student: true, age: true },
    location: 'Montreal, QC',
    badges: ['Verified Student', 'Tech Enthusiast', 'Basketball Player'],
    photos: ['photo1', 'photo2'],
    university: 'McGill University'
  },
  {
    id: '12',
    name: 'Zara Patel',
    avatar: 'https://randomuser.me/api/portraits/women/26.jpg',
    bio: 'British-Indian grad student. Chai enthusiast seeking fellow bookworms and cafe hoppers.',
    culturalBackground: ['Indian', 'British', 'South Asian'],
    languages: ['English', 'Gujarati', 'Hindi'],
    goals: ['Friends', 'Food buddies', 'Study pals'],
    pronouns: 'she/her',
    verified: { student: true, age: true },
    location: 'Vancouver, BC',
    mutualFriends: 3,
    badges: ['Verified Student', 'Book Club', 'Chai Expert'],
    photos: ['photo1', 'photo2', 'photo3'],
    university: 'UBC'
  }
];

export const mockPosts: Post[] = [
  {
    id: 'p1',
    userId: '1',
    content: 'Hey! Ill be in Toronto from Feb 2 to Feb 12. Looking for friends to explore the city—message me!',
    dateRange: { from: 'Feb 2', to: 'Feb 12' },
    timeRange: { from: '10AM', to: '2PM' },
    location: 'Downtown Toronto',
    capacity: 4,
    timestamp: '2h ago'
  },
  {
    id: 'p2',
    userId: '3',
    content: 'Anyone want to check out the new art exhibit at the museum this weekend? Would love some company!',
    location: 'Montreal arts district',
    dateRange: { from: 'Feb 2', to: 'Feb 12' },
    timeRange: { from: '10AM', to: '2PM' },
    capacity: 8,
    timestamp: '5h ago'
  },
  {
    id: 'p3',
    userId: '4',
    content: 'Looking for a gym buddy in the downtown area. I usually go in the mornings around 7am. Lets motivate each other!',
    location: 'Downtown Toronto',
    dateRange: { from: 'Feb 2', to: 'Feb 12' },
    timeRange: { from: '10AM', to: '2PM' },
    capacity: 8,
    timestamp: '1d ago'
  },
  {
    id: 'p4',
    userId: '8',
    content: 'Organizing a salsa night next Friday! If you love dancing or want to learn, come join us. All levels welcome!',
    dateRange: { from: 'Jan 24', to: 'Jan 24' },
    timeRange: { from: '10AM', to: '2PM' },
    capacity: 8,
    location: 'Montreal downtown',
    timestamp: '1d ago'
  },
  {
    id: 'p5',
    userId: '6',
    content: 'Found the best ramen spot near campus! Anyone want to grab lunch tomorrow? DM me!',
    location: 'Near UBC campus',
    timestamp: '2d ago',
    dateRange: { from: 'Feb 2', to: 'Feb 12' },
    timeRange: { from: '10AM', to: '2PM' },
    capacity: 8,
  },
  {
    id: 'p6',
    userId: '2',
    content: 'Study group forming for CPSC 320. Looking for 2-3 more people. We meet Tuesdays and Thursdays at the library.',
    location: 'UBC Library',
    dateRange: { from: 'Feb 2', to: 'Feb 12' },
    timeRange: { from: '10AM', to: '2PM' },
    capacity: 8,
    timestamp: '2d ago'
  },
  {
    id: 'p7',
    userId: '7',
    content: 'Apartment hunting in North York. Anyone else looking for a place? Maybe we can be roommates! Budget: $800-1000/month',
    dateRange: { from: 'Feb 2', to: 'Feb 12' },
    timeRange: { from: '10AM', to: '2PM' },
    capacity: 8,
    location: 'North York area',
    timestamp: '3d ago'
  },
  {
    id: 'p8',
    userId: '9',
    content: 'Cricket match this Sunday at the park! We need 2 more players. All skill levels welcome, just come have fun!',
    dateRange: { from: 'Jan 19', to: 'Jan 19' },
    timeRange: { from: '10AM', to: '2PM' },
    capacity: 8,
    location: 'Calgary East',
    timestamp: '3d ago'
  }
];