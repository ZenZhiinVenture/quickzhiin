interface PublicMenuItem {
  name: string;
  href: string;
  children?: PublicMenuItem[];
}

export default function publicMenu(locale: string): PublicMenuItem[] {
  return [
    {
      name: 'products',
      href: '/products',
      children: [
        {
          name: 'quickzhiin',
          href: `${locale}/products/quickzhiin`,
        },
        {
          name: 'einvoice',
          href: `${locale}/products/einvoice`,
        },
      ],
    },
    // {
    //   name: 'Company',
    //   href: '/company',
    //   children: [
    //     // {
    //     //   name: 'About',
    //     //   href: `${locale}/about`,
    //     // },
    //     // {
    //     //   name: 'Careers',
    //     //   href: `${locale}/company/careers`,
    //     // },
    //     {
    //       name: 'Partners',
    //       href: `${locale}/partner`,
    //     },
    //   ],
    // },
    {
      name: 'features',
      href: '/features',
    },
    {
      name: 'pricing',
      href: '/pricing',
      children: [
        {
          name: 'plans',
          href: `${locale}/plans`,
        },
        // {
        //   name: 'Enterprise',
        //   href: '/pricing/enterprise',
        // },
        // {
        //   name: 'Nonprofit',
        //   href: '/pricing/nonprofit',
        // },
        // {
        //   name: 'Education',
        //   href: '/pricing/education',
        // },
        // {
        //   name: 'Startup',
        //   href: '/pricing/startup',
        // },
        // {
        //   name: 'FreeTrial',
        //   href: '/pricing/free-trial',
        // },
        // {
        //   name: 'Contact Sales',
        //   href: '/pricing/contact-sales',
        // },
      ],
    },
    {
      name: 'resources',
      href: '/resources',
      children: [
        // {
        //   name: 'Blog',
        //   href: '/resources/blog',
        // },
        {
          name: 'webinars',
          href: `${locale}/resources/webinars`,
        },
        {
          name: 'documentation',
          href: `${locale}/resources/documentation`,
        },
        {
          name: 'support',
          href: `${locale}/resources/support`,
        },
      ],
    },
  ];
}
