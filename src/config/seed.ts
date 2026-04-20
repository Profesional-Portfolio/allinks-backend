import prismadb from '@/infraestructure/prismadb';

export async function seed() {
  // facebook, pinterest, linkedin, tiktok, x, youtube, snapchat, reddit, medium, threads, github, twitch
  const platforms = [
    {
      base_url: 'https://discord.gg',
      display_name: 'Discord',
      icon_url:
        'https://res.cloudinary.com/dqsvp22du/image/upload/v1763434190/discord-icon_j8smmx.png',
      name: 'discord',
      url_pattern: '^https?://(www\\.)?discord\\.(gg|com)/[\\w-]+/?$',
    },
    {
      base_url: '',
      display_name: 'Website',
      icon_url:
        'https://res.cloudinary.com/dqsvp22du/image/upload/v1763433046/website-icon_ubkbc1.svg',
      name: 'website',
      url_pattern: '^https?://[\\w.-]+\\.[a-z]{2,}/?.*$',
    },
    {
      base_url: 'https://facebook.com',
      display_name: 'Facebook',
      icon_url:
        'https://res.cloudinary.com/dqsvp22du/image/upload/v1763432957/facebook-icon_k08ldb.svg',
      name: 'facebook',
      url_pattern: '^https?://(www\\.)?facebook\\.com/[\\w.]+/?$',
    },
    {
      base_url: 'https://pinterest.com',
      display_name: 'Pinterest',
      icon_url:
        'https://res.cloudinary.com/dqsvp22du/image/upload/v1763432957/pinterest-icon_ryrwcz.svg',
      name: 'pinterest',
      url_pattern: '^https?://(www\\.)?pinterest\\.com/[\\w-]+/?$',
    },
    {
      base_url: 'https://linkedin.com/in',
      display_name: 'LinkedIn',
      icon_url:
        'https://res.cloudinary.com/dqsvp22du/image/upload/v1763432957/linkedin-icon_vjnjgy.svg',
      name: 'linkedin',
      url_pattern: '^https?://(www\\.)?linkedin\\.com/in/[\\w-]+/?$',
    },
    {
      base_url: 'https://x.com',
      display_name: 'X',
      icon_url:
        'https://res.cloudinary.com/dqsvp22du/image/upload/v1763432957/x-icon_z47tai.png',
      name: 'x',
      url_pattern: '^https?://(www\\.)?(twitter|x)\\.com/[\\w]+/?$',
    },
    {
      base_url: 'https://youtube.com',
      display_name: 'YouTube',
      icon_url:
        'https://res.cloudinary.com/dqsvp22du/image/upload/v1763432957/youtube-icon_hwauxf.png',
      name: 'youtube',
      url_pattern: '^https?://(www\\.)?youtube\\.com/(c/|channel/|@)[\\w-]+/?$',
    },
    {
      base_url: 'https://snapchat.com',
      display_name: 'Snapchat',
      icon_url:
        'https://res.cloudinary.com/dqsvp22du/image/upload/v1763432957/snapchat-icon_lp5huu.png',
      name: 'snapchat',
      url_pattern: '^https?://(www\\.)?snapchat\\.com/add/[\\w-]+/?$',
    },
    {
      base_url: 'https://reddit.com',
      display_name: 'Reddit',
      icon_url:
        'https://res.cloudinary.com/dqsvp22du/image/upload/v1763432957/reddit-icon_m0shyi.png',
      name: 'reddit',
      url_pattern: '^https?://(www\\.)?reddit\\.com/u/[\\w-]+/?$',
    },
    {
      base_url: 'https://medium.com',
      display_name: 'Medium',
      icon_url:
        'https://res.cloudinary.com/dqsvp22du/image/upload/v1763432957/medium-icon_yqurpb.png',
      name: 'medium',
      url_pattern: '^https?://(www\\.)?medium\\.com/@[\\w-]+/?$',
    },
    {
      base_url: 'https://threads.net',
      display_name: 'Threads',
      icon_url:
        'https://res.cloudinary.com/dqsvp22du/image/upload/v1763432956/threads-icon_dxs5rw.png',
      name: 'threads',
      url_pattern: '^https?://(www\\.)?threads\\.net/@[\\w-]+/?$',
    },
    {
      base_url: 'https://tiktok.com',
      display_name: 'TikTok',
      icon_url: '',
      name: 'tiktok',
      url_pattern: '^https?://(www\\.)?tiktok\\.com/@[\\w.]+/?$',
    },
    {
      base_url: 'https://github.com',
      display_name: 'GitHub',
      icon_url:
        'https://res.cloudinary.com/dqsvp22du/image/upload/v1763432956/github-icon_j6vfap.png',
      name: 'github',
      url_pattern: '^https?://(www\\.)?github\\.com/[\\w-]+/?$',
    },
    {
      base_url: 'https://instagram.com',
      display_name: 'Instagram',
      icon_url:
        'https://res.cloudinary.com/dqsvp22du/image/upload/v1763434893/instagram-icon_rfqkao.svg',
      name: 'instagram',
      url_pattern: '^https?://(www\\.)?instagram\\.com/[\\w.]+/?$',
    },
    {
      base_url: 'https://twitch.tv',
      display_name: 'Twitch',
      icon_url:
        'https://res.cloudinary.com/dqsvp22du/image/upload/v1763432956/twitch-icon_fcymyn.png',
      name: 'twitch',
      url_pattern: '^https?://(www\\.)?twitch\\.tv/[\\w]+/?$',
    },
  ];

  // delete existing platforms
  // await prismadb.platform.deleteMany();
  // add new platforms
  for (const platform of platforms) {
    const { base_url, display_name, icon_url, name, url_pattern } = platform;
    await prismadb.platform.create({
      data: {
        base_url,
        created_at: new Date(),
        display_name,
        icon_url,
        is_active: true,
        name,
        url_pattern,
      },
    });
  }
}

seed()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prismadb.$disconnect();
  });
