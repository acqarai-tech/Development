const STORAGE_KEY = 'acqar_blogs';

const initialBlogs = [
  {
    id: '1',
    title: 'The Future of Real Estate in Dubai: 2026 and Beyond',
    excerpt: 'Explore how AI and blockchain are reshaping the property market in the UAE.',
    content: 'Dubai has always been at the forefront of innovation. In 2026, we are seeing a massive shift towards AI-driven valuations and transparent blockchain transactions...',
    author: 'Acqar Intelligence Team',
    date: '2026-03-01',
    imageUrl: 'https://picsum.photos/seed/dubai1/800/600',
    readCount: 1240,
    status: 'published',
  },
  {
    id: '2',
    title: 'Why AI Valuations are More Accurate Than Traditional Methods',
    excerpt: "A deep dive into the algorithms behind Acqar's premium property intelligence.",
    content: 'Traditional property valuation often relies on subjective human judgment. Acqar uses millions of data points to provide an objective, real-time value...',
    author: 'Dr. Sarah Chen',
    date: '2026-02-15',
    imageUrl: 'https://picsum.photos/seed/ai/800/600',
    readCount: 850,
    status: 'published',
  },
];

export const blogService = {
  getBlogs: () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialBlogs));
      return initialBlogs;
    }
    return JSON.parse(stored);
  },

  getBlogById: (id) => {
    const blogs = blogService.getBlogs();
    return blogs.find(b => b.id === id);
  },

  saveBlog: (blog) => {
    const blogs = blogService.getBlogs();
    const index = blogs.findIndex(b => b.id === blog.id);
    if (index > -1) {
      blogs[index] = blog;
    } else {
      blogs.push(blog);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blogs));
  },

  deleteBlog: (id) => {
    const blogs = blogService.getBlogs();
    const filtered = blogs.filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  incrementReadCount: (id) => {
    const blogs = blogService.getBlogs();
    const blog = blogs.find(b => b.id === id);
    if (blog) {
      blog.readCount += 1;
      blogService.saveBlog(blog);
    }
  },
};
