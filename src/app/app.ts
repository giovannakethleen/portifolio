import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
} from '@angular/core';

interface Skill {
  icon: string;
  title: string;
  description: string;
}

interface Project {
  number: string;
  title: string;
  description: string;
  tags: string[];
  link: string;
  github?: string;
}

interface Contact {
  icon: string;
  title: string;
  description: string;
  link: string;
  featured: boolean;
}

interface Star {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  speed: number;
  direction: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  life: number;
}

interface TrailStar {
  x: number;
  y: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
  life: number;
  decay: number;
}

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements AfterViewInit, OnDestroy {
  @ViewChild('starsCanvas') private starsCanvas!: ElementRef<HTMLCanvasElement>;

  protected readonly name = 'Giovanna Kethleen';
  protected readonly role = 'Software Engineer';
  protected readonly company = 'Serasa Experian';
  protected readonly stack = ['PHP', 'Laravel', 'Angular', 'Python', 'ReactJS'];
  protected readonly linkedin =
    'https://www.linkedin.com/in/giovannakethleen/';
  protected readonly github = 'https://github.com/giovannakethleen';
  protected readonly year = new Date().getFullYear();
  protected isMenuOpen = false;
  protected isScrolled = false;

  protected readonly skills: Skill[] = [
    {
      icon: 'bi-code-slash',
      title: 'Back-end',
      description: 'PHP, Laravel, Python',
    },
    {
      icon: 'bi-window-stack',
      title: 'Front-end',
      description: 'Angular, TypeScript, ReactJS, Bootstrap',
    },
    {
      icon: 'bi-database',
      title: 'Banco de Dados',
      description: 'Oracle, PostgreSQL',
    },
  ];

  protected readonly projects: Project[] = [
    {
      number: '01',
      title: 'Cosmic Pinball',
      description: 'Jogo de pinball com temática cósmica.',
      tags: ['Jogo', 'Web'],
      link: 'https://gk-pinball.netlify.app/',
      github: 'https://github.com/giovannakethleen/pinball-game',
    },
    {
      number: '02',
      title: 'Nebula Strike',
      description: 'Jogo com temática espacial.',
      tags: ['Jogo', 'Web'],
      link: 'https://gk-nebula-strike.netlify.app/',
      github: 'https://github.com/giovannakethleen/nebula-strike',
    },
    {
      number: '03',
      title: 'RocketNotes',
      description:
        'Aplicação web para criação e organização de notas, com autenticação de usuários e categorização por tags.',
      tags: ['NodeJS', 'ReactJS'],
      link: 'https://github.com/giovannakethleen/rockeatnotesFront',
    },
    {
      number: '04',
      title: 'Gerador de Certificados',
      description:
        'Sistema para criação automática de certificados personalizados a partir de templates e listas de participantes.',
      tags: ['Angular', 'TypeScript'],
      link: 'https://github.com/giovannakethleen/Certificad',
    },
    {
      number: '05',
      title: 'Links',
      description:
        'Página de links personalizados no estilo Linktree. Meu primeiro projeto, desenvolvido em 2023.',
      tags: ['HTML', 'CSS', 'JavaScript'],
      link: 'https://github.com/giovannakethleen/links',
    },
    {
      number: '06',
      title: 'Formulário de Eventos',
      description:
        'Formulário de inscrição para eventos com validação de campos. Meu segundo projeto, desenvolvido em 2023.',
      tags: ['HTML', 'CSS', 'JavaScript'],
      link: 'https://github.com/giovannakethleen/form',
    },
  ];

  protected readonly contacts: Contact[] = [
    {
      icon: 'bi-linkedin',
      title: 'LinkedIn',
      description: 'Vamos nos conectar profissionalmente',
      link: this.linkedin,
      featured: true,
    },
    {
      icon: 'bi-github',
      title: 'GitHub',
      description: 'Confira meu código e repositórios',
      link: this.github,
      featured: false,
    },
  ];

  private context: CanvasRenderingContext2D | null = null;
  private stars: Star[] = [];
  private shootingStars: ShootingStar[] = [];
  private trailStars: TrailStar[] = [];
  private animationFrame = 0;
  private lastDust = 0;
  private revealObserver: IntersectionObserver | null = null;
  private readonly mouse = {
    x: -1000,
    y: -1000,
    previousX: -1000,
    previousY: -1000,
    vx: 0,
    vy: 0,
  };

  private readonly handleMouseMove = (event: MouseEvent): void => {
    this.mouse.previousX = this.mouse.x;
    this.mouse.previousY = this.mouse.y;
    this.mouse.x = event.clientX;
    this.mouse.y = event.clientY;
    this.mouse.vx = this.mouse.x - this.mouse.previousX;
    this.mouse.vy = this.mouse.y - this.mouse.previousY;
    this.spawnDust();
  };

  private readonly handleMouseLeave = (): void => {
    this.mouse.x = -1000;
    this.mouse.y = -1000;
  };

  private readonly resizeCanvas = (): void => {
    const canvas = this.starsCanvas.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const count = Math.floor((canvas.width * canvas.height) / 6000);
    this.stars = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.4 + 0.2,
      alpha: Math.random(),
      speed: Math.random() * 0.015 + 0.003,
      direction: Math.random() > 0.5 ? 1 : -1,
    }));
  };

  private readonly draw = (): void => {
    const canvas = this.starsCanvas.nativeElement;
    const context = this.context;
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    for (const star of this.stars) {
      star.alpha += star.speed * star.direction;
      if (star.alpha <= 0.1 || star.alpha >= 1) star.direction *= -1;
      context.beginPath();
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(255,255,255,${star.alpha})`;
      context.fill();
    }

    this.maybeCreateShootingStar(canvas.width, canvas.height);
    this.shootingStars = this.shootingStars.filter((star) => {
      const dx = Math.cos(star.angle) * star.length;
      const dy = Math.sin(star.angle) * star.length;
      const gradient = context.createLinearGradient(
        star.x,
        star.y,
        star.x - dx,
        star.y - dy,
      );
      gradient.addColorStop(0, `rgba(190,170,255,${star.life})`);
      gradient.addColorStop(1, 'rgba(190,170,255,0)');
      context.beginPath();
      context.strokeStyle = gradient;
      context.lineWidth = 2;
      context.moveTo(star.x, star.y);
      context.lineTo(star.x - dx, star.y - dy);
      context.stroke();
      star.x += Math.cos(star.angle) * star.speed;
      star.y += Math.sin(star.angle) * star.speed;
      star.life -= 0.012;
      return star.life > 0 && star.x <= canvas.width + 200;
    });

    this.trailStars = this.trailStars.filter((star) => {
      const radius = star.radius * (1 + (1 - star.life) * 1.5);
      const gradient = context.createRadialGradient(
        star.x,
        star.y,
        0,
        star.x,
        star.y,
        radius * 4,
      );
      gradient.addColorStop(0, `rgba(${star.color},${star.life * 0.5})`);
      gradient.addColorStop(1, `rgba(${star.color},0)`);
      context.beginPath();
      context.arc(star.x, star.y, radius * 4, 0, Math.PI * 2);
      context.fillStyle = gradient;
      context.fill();
      context.beginPath();
      context.arc(star.x, star.y, radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(${star.color},${star.life})`;
      context.fill();
      star.x += star.vx;
      star.y += star.vy;
      star.vx *= 0.96;
      star.vy *= 0.96;
      star.life -= star.decay;
      return star.life > 0;
    });

    this.animationFrame = requestAnimationFrame(this.draw);
  };

  ngAfterViewInit(): void {
    this.context = this.starsCanvas.nativeElement.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeCanvas);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseleave', this.handleMouseLeave);
    this.animationFrame = requestAnimationFrame(this.draw);

    if ('IntersectionObserver' in window) {
      this.revealObserver = new IntersectionObserver(
        (entries, observer) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add('active');
              observer.unobserve(entry.target);
            }
          }
        },
        { threshold: 0.15 },
      );
      document
        .querySelectorAll(
          '.skill-card, .project-card, .contact-channel, .section-title, .lead-text',
        )
        .forEach((element) => {
          element.classList.add('reveal');
          this.revealObserver?.observe(element);
        });
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeCanvas);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseleave', this.handleMouseLeave);
    cancelAnimationFrame(this.animationFrame);
    this.revealObserver?.disconnect();
  }

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    this.isScrolled = window.scrollY > 30;
  }

  protected toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  protected closeMenu(): void {
    this.isMenuOpen = false;
  }

  private maybeCreateShootingStar(width: number, height: number): void {
    if (Math.random() < 0.0025 && this.shootingStars.length < 2) {
      this.shootingStars.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.4,
        length: Math.random() * 120 + 80,
        speed: Math.random() * 8 + 6,
        angle: Math.PI / 5,
        life: 1,
      });
    }
  }

  private spawnDust(): void {
    const now = performance.now();
    const speed = Math.hypot(this.mouse.vx, this.mouse.vy);
    if (speed < 1.2 || now - this.lastDust < 28) return;
    this.lastDust = now;

    const colors = ['167,139,250', '96,165,250', '34,211,238', '244,244,255'];
    const count = Math.min(Math.floor(speed / 4) + 1, 3);
    for (let i = 0; i < count; i++) {
      this.trailStars.push({
        x: this.mouse.x + (Math.random() - 0.5) * 6,
        y: this.mouse.y + (Math.random() - 0.5) * 6,
        radius: Math.random() * 1.8 + 0.6,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.6 + this.mouse.vx * 0.04,
        vy: (Math.random() - 0.5) * 0.6 + this.mouse.vy * 0.04,
        life: 1,
        decay: Math.random() * 0.015 + 0.012,
      });
    }
    if (this.trailStars.length > 80) {
      this.trailStars.splice(0, this.trailStars.length - 80);
    }
  }
}
