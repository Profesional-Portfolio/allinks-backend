import prismadb from '@/infraestructure/prismadb';

export async function seed() {
  // facebook, pinterest, linkedin, tiktok, x, youtube, snapchat, reddit, medium, threads, github, twitch
  const platforms = [
    {
      name: 'discord',
      display_name: 'Discord',
      url_pattern: '^https?://(www\\.)?discord\\.(gg|com)/[\\w-]+/?$',
      base_url: 'https://discord.gg',
      icon_url:
        'https://res.cloudinary.com/dqsvp22du/image/upload/v1763434190/discord-icon_j8smmx.png',
    },
    {
      name: 'website',
      display_name: 'Website',
      url_pattern: '^https?://[\\w.-]+\\.[a-z]{2,}/?.*$',
      base_url: '',
      icon_url:
        'https://res.cloudinary.com/dqsvp22du/image/upload/v1763433046/website-icon_ubkbc1.svg',
    },
    {
      name: 'facebook',
      display_name: 'Facebook',
      url_pattern: '^https?://(www\\.)?facebook\\.com/[\\w.]+/?$',
      base_url: 'https://facebook.com',
      icon_url:
        'https://res.cloudinary.com/dqsvp22du/image/upload/v1763432957/facebook-icon_k08ldb.svg',
    },
    {
      name: 'pinterest',
      display_name: 'Pinterest',
      url_pattern: '^https?://(www\\.)?pinterest\\.com/[\\w-]+/?$',
      base_url: 'https://pinterest.com',
      icon_url:
        'https://res.cloudinary.com/dqsvp22du/image/upload/v1763432957/pinterest-icon_ryrwcz.svg',
    },
    {
      name: 'linkedin',
      display_name: 'LinkedIn',
      url_pattern: '^https?://(www\\.)?linkedin\\.com/in/[\\w-]+/?$',
      base_url: 'https://linkedin.com/in',
      icon_url:
        'https://res.cloudinary.com/dqsvp22du/image/upload/v1763432957/linkedin-icon_vjnjgy.svg',
    },
    {
      name: 'x',
      display_name: 'X',
      url_pattern: '^https?://(www\\.)?(twitter|x)\\.com/[\\w]+/?$',
      base_url: 'https://x.com',
      icon_url:
        'https://res.cloudinary.com/dqsvp22du/image/upload/v1763432957/x-icon_z47tai.png',
    },
    {
      name: 'youtube',
      display_name: 'YouTube',
      url_pattern: '^https?://(www\\.)?youtube\\.com/(c/|channel/|@)[\\w-]+/?$',
      base_url: 'https://youtube.com',
      icon_url:
        'https://res.cloudinary.com/dqsvp22du/image/upload/v1763432957/youtube-icon_hwauxf.png',
    },
    {
      name: 'snapchat',
      display_name: 'Snapchat',
      url_pattern: '^https?://(www\\.)?snapchat\\.com/add/[\\w-]+/?$',
      base_url: 'https://snapchat.com',
      icon_url:
        'https://res.cloudinary.com/dqsvp22du/image/upload/v1763432957/snapchat-icon_lp5huu.png',
    },
    {
      name: 'reddit',
      display_name: 'Reddit',
      url_pattern: '^https?://(www\\.)?reddit\\.com/u/[\\w-]+/?$',
      base_url: 'https://reddit.com',
      icon_url:
        'https://res.cloudinary.com/dqsvp22du/image/upload/v1763432957/reddit-icon_m0shyi.png',
    },
    {
      name: 'medium',
      display_name: 'Medium',
      url_pattern: '^https?://(www\\.)?medium\\.com/@[\\w-]+/?$',
      base_url: 'https://medium.com',
      icon_url:
        'https://res.cloudinary.com/dqsvp22du/image/upload/v1763432957/medium-icon_yqurpb.png',
    },
    {
      name: 'threads',
      display_name: 'Threads',
      url_pattern: '^https?://(www\\.)?threads\\.net/@[\\w-]+/?$',
      base_url: 'https://threads.net',
      icon_url:
        'https://res.cloudinary.com/dqsvp22du/image/upload/v1763432956/threads-icon_dxs5rw.png',
    },
    {
      name: 'tiktok',
      display_name: 'TikTok',
      url_pattern: '^https?://(www\\.)?tiktok\\.com/@[\\w.]+/?$',
      base_url: 'https://tiktok.com',
      icon_url: '',
    },
    {
      name: 'github',
      display_name: 'GitHub',
      url_pattern: '^https?://(www\\.)?github\\.com/[\\w-]+/?$',
      base_url: 'https://github.com',
      icon_url:
        'https://res.cloudinary.com/dqsvp22du/image/upload/v1763432956/github-icon_j6vfap.png',
    },
    {
      name: 'instagram',
      display_name: 'Instagram',
      url_pattern: '^https?://(www\\.)?instagram\\.com/[\\w.]+/?$',
      base_url: 'https://instagram.com',
      icon_url:
        'https://res.cloudinary.com/dqsvp22du/image/upload/v1763434893/instagram-icon_rfqkao.svg',
    },
    {
      name: 'twitch',
      display_name: 'Twitch',
      url_pattern: '^https?://(www\\.)?twitch\\.tv/[\\w]+/?$',
      base_url: 'https://twitch.tv',
      icon_url:
        'https://res.cloudinary.com/dqsvp22du/image/upload/v1763432956/twitch-icon_fcymyn.png',
    },
  ];

  // delete existing platforms
  // await prismadb.platform.deleteMany();
  // add new platforms
  for (const platform of platforms) {
    const { name, display_name, url_pattern, base_url, icon_url } = platform;
    await prismadb.platform.create({
      data: {
        name,
        display_name,
        url_pattern,
        base_url,
        icon_url,
        is_active: true,
        created_at: new Date(),
      },
    });
  }
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prismadb.$disconnect();
  });
