import { Link } from "react-router-dom";
import { Users, Globe, Heart, Zap, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const About = () => {
  // Dummy Team Data
  const team = [
    {
      name: "Alex Developer",
      role: "Founder & Lead Editor",
      avatar: "https://github.com/shadcn.png",
    },
    {
      name: "Sarah Smith",
      role: "Content Strategist",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    },
    {
      name: "John Doe",
      role: "Tech Reviewer",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    },
  ];

  return (
    <div className='container  py-12 md:py-20 mx-auto'>
      {/* --- HERO SECTION --- */}
      <div className='text-center space-y-4 mb-16'>
        <h1 className='text-4xl md:text-6xl font-extrabold tracking-tight'>
          We tell stories that <span className='text-primary'>matter</span>.
        </h1>
        <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
          A place where code, design, and lifestyle meet. We are dedicated to
          sharing knowledge and inspiring developers around the world.
        </p>
      </div>

      {/* --- MISSION SECTION (Image + Text) --- */}
      <div className='grid md:grid-cols-2 gap-12 items-center mb-24'>
        <div className='space-y-6'>
          <h2 className='text-3xl font-bold'>Our Mission</h2>
          <p className='text-lg text-muted-foreground leading-relaxed'>
            Founded in 2023, MyBlog started as a small personal project to
            document coding challenges. Today, it has grown into a community of
            passionate learners and creators.
          </p>
          <p className='text-lg text-muted-foreground leading-relaxed'>
            We believe that knowledge should be free and accessible. Whether you
            are a beginner trying to center a div, or a senior engineer
            architecting a system, you belong here.
          </p>

          <div className='flex gap-4 pt-4'>
            <div className='flex flex-col'>
              <span className='font-bold text-3xl'>50k+</span>
              <span className='text-sm text-muted-foreground'>
                Monthly Readers
              </span>
            </div>
            <Separator orientation='vertical' className='h-12' />
            <div className='flex flex-col'>
              <span className='font-bold text-3xl'>100+</span>
              <span className='text-sm text-muted-foreground'>
                Articles Published
              </span>
            </div>
          </div>
        </div>

        {/* Right Image */}
        <div className='rounded-xl overflow-hidden shadow-xl border bg-muted aspect-video md:aspect-square relative'>
          <img
            src='https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'
            alt='Team working together'
            className='object-cover w-full h-full hover:scale-105 transition-transform duration-500'
          />
        </div>
      </div>

      {/* --- VALUES SECTION --- */}
      <div className='bg-muted/30 py-16 px-8 rounded-3xl mb-24'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold'>Why Read Us?</h2>
        </div>

        <div className='grid md:grid-cols-3 gap-8'>
          {/* Value 1 */}
          <div className='flex flex-col items-center text-center space-y-4'>
            <div className='p-4 bg-background rounded-full shadow-sm text-primary'>
              <Zap className='h-8 w-8' />
            </div>
            <h3 className='font-bold text-xl'>Up to Date</h3>
            <p className='text-muted-foreground'>
              We cover the latest trends in React, AI, and modern web
              development.
            </p>
          </div>

          {/* Value 2 */}
          <div className='flex flex-col items-center text-center space-y-4'>
            <div className='p-4 bg-background rounded-full shadow-sm text-primary'>
              <Users className='h-8 w-8' />
            </div>
            <h3 className='font-bold text-xl'>Community First</h3>
            <p className='text-muted-foreground'>
              We listen to our readers. Our content is driven by what you want
              to learn.
            </p>
          </div>

          {/* Value 3 */}
          <div className='flex flex-col items-center text-center space-y-4'>
            <div className='p-4 bg-background rounded-full shadow-sm text-primary'>
              <Globe className='h-8 w-8' />
            </div>
            <h3 className='font-bold text-xl'>Global Reach</h3>
            <p className='text-muted-foreground'>
              Writers from all over the world contributing diverse perspectives.
            </p>
          </div>
        </div>
      </div>

      {/* --- TEAM SECTION --- */}
      <div className='mb-24'>
        <h2 className='text-3xl font-bold text-center mb-12'>Meet the Team</h2>
        <div className='grid md:grid-cols-3 gap-8'>
          {team.map((member, index) => (
            <div
              key={index}
              className='flex flex-col items-center text-center space-y-3 p-6 border rounded-lg hover:shadow-lg transition-shadow'
            >
              <Avatar className='h-24 w-24'>
                <AvatarImage src={member.avatar} />
                <AvatarFallback>{member.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className='font-bold text-lg'>{member.name}</h3>
                <p className='text-primary text-sm font-medium'>
                  {member.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- CTA SECTION --- */}
      <div className='text-center space-y-6 max-w-2xl mx-auto'>
        <h2 className='text-3xl font-bold'>Ready to start reading?</h2>
        <p className='text-muted-foreground text-lg'>
          Join thousands of developers who are leveling up their skills every
          day.
        </p>
        <div className='flex justify-center gap-4'>
          <Button size='lg' asChild>
            <Link to='/'>
              Explore Articles <ArrowRight className='ml-2 h-4 w-4' />
            </Link>
          </Button>
          <Button variant='outline' size='lg' asChild>
            <Link to='/register'>Join Community</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default About;
