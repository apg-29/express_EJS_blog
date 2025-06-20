import express from "express";
import expressLayouts from 'express-ejs-layouts';
import bodyParser from "body-parser";
import ejs from "ejs";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);

app.use(express.static("public")); // Serve static files from the "public" directory

let posts = [ // Sample posts data
  { id: 1, title: 'AI expectations in 2030', content: '...', category: 'Technology', comments: [] },
  { id: 2, title: 'Working out and Diet', content: '...', category: 'Lifestyle', comments: [] },
  { id: 3, title: 'Popular services keep adding AI. Some customers want them to stop.', content: 'Since ChatGPT launched at the end of 2022, AI chatbots have taken off in popularity, with people using them for brainstorming, internet searches, companionship and therapy. Many companies joined the rush and started to wedge AI into their existing products. Zoom offers AI summaries of conference calls, and Microsoft Office apps have AI around every corner, waiting to help write a letter or make a presentation. Behind the scenes, companies are using AI to take over more human tasks such as customer service work and coding.', category: 'Technology', comments: [] },
  { id: 4, title: 'Tech Trends', content: '...', category: 'Lifestyle', comments: [] },
  { id: 5, title: 'Tech Trends', content: '...', category: 'Technology', comments: [] },
  { id: 6, title: 'Tech Trends', content: '...', category: 'Technology', comments: [] },
  { id: 7, title: 'Tech Trends', content: '...', category: 'Technology', comments: [] },
  { id: 8, title: 'Tech Trends', content: '...', category: 'Technology', comments: [] },
  { id: 9, title: 'Tech Trends', content: '...', category: 'Technology', comments: [] },
];


app.get('/', (req, res) => {  // Home route to display posts and handle pagination, search, and category filtering
  const { category, search, page = 1 } = req.query;
  let filteredPosts = posts;

  // Apply category filter
  if (category) {
    filteredPosts = filteredPosts.filter(post => post.category === category);
  }

  // Apply search filter
  if (search) {
    filteredPosts = filteredPosts.filter(post =>
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.content.toLowerCase().includes(search.toLowerCase())
    );
  }
 const POSTS_PER_PAGE = 5; // Define how many posts to show per page
  const start = (page - 1) * POSTS_PER_PAGE;
  const end = start + POSTS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(start, end);

  res.render('index', { // Render the index page with posts, pagination, search, and category filters
    posts: paginatedPosts, 
    currentPage: parseInt(page), 
    totalPages: Math.ceil(posts.length / POSTS_PER_PAGE), 
    filteredPosts, 
    search, 
    category });
});

// Show create post form
app.get("/posts/new", (req, res) => {
  res.render("new", { search: "", category: "" });  // Render the new post form
});

app.get("/posts/:id", (req, res) => { // Show a specific post with comments
    const postId = parseInt(req.params.id, 10);
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
        return res.status(404).send("Post not found");
    }
    
    res.render("post", { post, comments: post.comments || [], search: "", category: "" });  // Render the post details
    });

app.get("/posts/:id/edit", (req, res) => {  // Show edit form for a specific post
    const postId = parseInt(req.params.id, 10);
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
        return res.status(404).send("Post not found");
    }
    
    res.render("edit", { post, search: "", category: "" });  // Render the edit form with post data
});

app.post("/posts/:id/edit", (req, res) => {  // Handle post updates
    const postId = parseInt(req.params.id, 10);
    const { title, content } = req.body;
    
    let post = posts.find(p => p.id === postId);
    if (!post) {
        return res.status(404).send("Post not found");
    }
    post.title = title;  // Update the post title
    post.content = content;  // Update the post content
    res.redirect(`/posts/${postId}`);  // Redirect to the updated post
});

// Handle comment submission
app.post('/posts/:id/comment', (req, res) => {
  const postId = parseInt(req.params.id, 10);
  const { content } = req.body;
  const post = posts.find(p => p.id === postId);
  if (!post) return res.status(404).send("Post not found");

  const comment = { content, user: req.user ? req.user.username : 'Anonymous' };
  post.comments.push(comment);
  res.redirect(`/posts/${postId}`);
});



app.post("/posts/:id/delete", (req, res) => {  // Handle post deletion
    const postId = parseInt(req.params.id, 10);
    posts = posts.filter(p => p.id !== postId);  // Remove the post from the array
    res.redirect("/");
});

app.post("/posts", (req, res) => { // Handle new post creation
  const { title, content } = req.body;
  const newPost = {
    id: posts.length + 1,  // Generate a simple ID
    title,
    content,
    comments: [],
  };
  posts.push(newPost);  // Add the new post to the array
  res.redirect("/");  // Redirect to home page after creation
});



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
