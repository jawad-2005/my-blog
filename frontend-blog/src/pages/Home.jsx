import BlogHome from "@/components/BlogHome";

import React from "react";

const Home = () => {
  return (
    <div>
      <div className='mb-8 text-center'>
        <h1 className='text-4xl font-extrabold tracking-tight lg:text-5xl mb-4'>
          Welcome to My Blog
        </h1>
        <p className='text-muted-foreground text-lg max-w-2xl mx-auto'>
          Discover the latest stories, thinking, and tutorials about code,
          design
        </p>
      </div>

      <div>
        <BlogHome />
      </div>
    </div>
  );
};

export default Home;
