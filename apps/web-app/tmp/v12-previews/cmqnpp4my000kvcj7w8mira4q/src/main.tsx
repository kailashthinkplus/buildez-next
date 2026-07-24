import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
type IconName = 'search' | 'user' | 'bag' | 'menu' | 'close' | 'leaf' | 'bottle' | 'seal' | 'chevron';
type Product = {
    title: string;
    price: string;
    oldPrice?: string;
    image: string;
    rating: number;
    badge?: string;
    action?: string;
};
const Icon = ({ name, size = 20 }: {
    name: IconName;
    size?: number;
}) => {
    const common = {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.65,
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const
    };
    const icons: Record<IconName, React.ReactNode> = {
        search: <><circle cx='11' cy='11' r='6.5' data-buildez-id="be-6189195339fd8b" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="826" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5"/><path d='m19.5 19.5-4-4' data-buildez-id="be-3c333c9cebea04" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="859" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5"/></>,
        user: <><circle cx='12' cy='8' r='3.2' data-buildez-id="be-8aebc936ee829c" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="906" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5"/><path d='M5.7 20c.5-3.8 2.6-5.7 6.3-5.7s5.8 1.9 6.3 5.7' data-buildez-id="be-f69b5b5cbb4529" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="938" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5"/></>,
        bag: <><path d='M5.5 8.5h13l-1 11h-11l-1-11Z' data-buildez-id="be-e5850fdd955411" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="1016" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5"/><path d='M9 9V6.7a3 3 0 0 1 6 0V9' data-buildez-id="be-24a8693d31d7d4" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="1056" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5"/></>,
        menu: <path d='M4 7h16M4 12h16M4 17h16' data-buildez-id="be-3c17881d9b6fae" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="1111" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5"/>,
        close: <path d='m5 5 14 14M19 5 5 19' data-buildez-id="be-86cd013c3d266a" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="1163" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5"/>,
        leaf: <><path d='M19.5 4.5C12 4.8 6.4 8.2 6.3 14.3c0 3 2.1 5.2 5 5.2 6.1-.1 8.1-7.6 8.2-15Z' data-buildez-id="be-36095e390ac0a7" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="1213" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5"/><path d='M5 20c2.2-4.1 5.2-7.1 9.6-9.2' data-buildez-id="be-311b286ed288dd" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="1299" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5"/></>,
        bottle: <><path d='M10 3h4v4h-4zM9 7h6l2 4v9H7v-9l2-4Z' data-buildez-id="be-f3496764de0ce8" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="1363" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5"/><path d='M9 12h6' data-buildez-id="be-952f4316834140" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="1410" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5"/></>,
        seal: <><path d='m12 3 2 1.3 2.4-.1.7 2.3L19 8l-.8 2.3.8 2.3-1.9 1.5-.7 2.4-2.4-.1-2 1.3-2-1.3-2.4.1-.7-2.4L5 12.6l.8-2.3L5 8l1.9-1.5.7-2.3 2.4.1L12 3Z' data-buildez-id="be-d628882de0c88e" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="1450" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5"/><path d='m9 10.5 2 2 4-4' data-buildez-id="be-f7fc9f87bbed7f" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="1596" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5"/></>,
        chevron: <path d='m8 10 4 4 4-4' data-buildez-id="be-54225cde079e63" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="1645" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5"/>
    };
    return <svg aria-hidden='true' {...common} data-buildez-id="be-5c81e7cea27dc7" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="1689" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">{icons[name]}</svg>;
};
const newProducts: Product[] = [
    {
        title: 'Set of body care combo products',
        price: '$29.00 – $48.50',
        image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=900&q=88',
        rating: 5,
        action: 'View products'
    },
    {
        title: 'Rice body scrub with argan oil',
        price: '$35.00',
        image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=88',
        rating: 5
    },
    {
        title: 'Hyaluronic skin booster',
        price: '$48.50',
        image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=900&q=88',
        rating: 4
    },
    {
        title: 'Shower & bath gel',
        price: '$29.00',
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=88',
        rating: 4
    }
];
const saleProducts: Product[] = [
    {
        title: 'Vitamin C 3% serum',
        price: '$80.00',
        oldPrice: '$95.00',
        image: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=900&q=88',
        rating: 5,
        badge: 'Sale'
    },
    {
        title: 'Gentle Foaming Face Wash',
        price: '$38.00',
        oldPrice: '$50.00',
        image: 'https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?auto=format&fit=crop&w=900&q=88',
        rating: 5,
        badge: 'Sale'
    },
    {
        title: 'Hydrating Night Moisturizer',
        price: '$28.00',
        oldPrice: '$40.00',
        image: 'https://images.unsplash.com/photo-1611930021592-a8cfd5319ceb?auto=format&fit=crop&w=900&q=88',
        rating: 2,
        badge: 'Sale'
    },
    {
        title: 'Salicylic Acid Toner',
        price: '$26.00',
        oldPrice: '$30.00',
        image: 'https://images.unsplash.com/photo-1624454002429-40ed87a5ec17?auto=format&fit=crop&w=900&q=88',
        rating: 5,
        badge: 'Sale'
    }
];
const blogPosts = [
    {
        title: '5 signs that skin lacks moisture',
        text: 'Increased sensitivity is one of the first signs that it’s time to add a more intensive moisturizing cream.',
        image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=86'
    },
    {
        title: 'Beauty from within: nutrition and skin health',
        text: 'Discover how vitamins, hydration, and balanced meals play a vital role in achieving a natural glow.',
        image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1000&q=86'
    },
    {
        title: 'Nutrition and skin health',
        text: 'Discover how thoughtful daily rituals help support balanced, comfortable and naturally radiant skin.',
        image: 'https://images.unsplash.com/photo-1575410229391-19b4da01cc94?auto=format&fit=crop&w=1000&q=86'
    }
];
function ProductCard({ product, onAdd }: {
    product: Product;
    onAdd: (title: string) => void;
}) {
    return (<article className='product-card' data-buildez-id="be-eb71514b082405" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="4771" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
      <div className='product-image-wrap' data-buildez-id="be-fbfbe5bce0a29f" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="4812" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
        {product.badge && <span className='badge' data-buildez-id="be-9309aa0a2da161" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="4875" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">{product.badge}</span>}
        <img className='product-image' src={product.image} alt={product.title} loading='lazy' data-buildez-id="be-a31f674bd1181d" data-buildez-kind="image" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="4931" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,image,accessibility" data-buildez-revision="5"/>
        <button className='quick-add' onClick={() => onAdd(product.title)} aria-label={`Quick add ${product.title}`} data-buildez-id="be-fd92168137088b" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="5027" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">+</button>
      </div>
      <h3 data-buildez-id="be-bc37aec1d72775" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="5166" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">{product.title}</h3>
      <div className='price-row' data-buildez-id="be-0bbae47d92dc59" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="5197" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
        <span className={product.oldPrice ? 'sale-price' : ''} data-buildez-id="be-de17d8d5b7e3b7" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="5233" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">{product.price}</span>
        {product.oldPrice && <del data-buildez-id="be-35dc2f80a790e6" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="5340" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">{product.oldPrice}</del>}
      </div>
      <div className='product-bottom' data-buildez-id="be-3132f266f504b8" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="5390" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
        <button className='pill dark' onClick={() => onAdd(product.title)} data-buildez-id="be-c5b8a5dcf2e193" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="5431" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">{product.action || 'Add to cart'}</button>
        <span className='stars' aria-label={`${product.rating} out of 5 stars`} data-buildez-id="be-5842921727b3cf" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="5549" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">
          {[1, 2, 3, 4, 5].map(star => <span className={star <= product.rating ? '' : 'muted'} key={star} data-buildez-id="be-60b63bf689ebc5" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="5661" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">★</span>)}
        </span>
      </div>
    </article>);
}
function App() {
    const [cartCount, setCartCount] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const [notice, setNotice] = useState('');
    const newProductsRef = useRef<HTMLDivElement>(null);
    const saleProductsRef = useRef<HTMLDivElement>(null);
    const noticeTimer = useRef<number | undefined>(undefined);
    useEffect(() => () => window.clearTimeout(noticeTimer.current), []);
    const showNotice = (message: string) => {
        window.clearTimeout(noticeTimer.current);
        setNotice(message);
        noticeTimer.current = window.setTimeout(() => setNotice(''), 2600);
    };
    const addToCart = (title: string) => {
        setCartCount(value => value + 1);
        showNotice(`${title} added to your bag`);
    };
    const scrollProducts = (ref: React.RefObject<HTMLDivElement | null>, direction: number) => {
        ref.current?.scrollBy({ left: direction * 340, behavior: 'smooth' });
    };
    const subscribe = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const email = String(new FormData(form).get('email') || '');
        if (!email) {
            showNotice('Please enter your email address.');
            return;
        }
        showNotice('Welcome to Sunlit Meadows — your 10% offer is on its way!');
        form.reset();
    };
    const closeMenu = () => setMenuOpen(false);
    return (<div className='site-shell' data-buildez-id="be-6bf55d277906b1" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="7224" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
      {notice && <div className='toast' role='status' data-buildez-id="be-b2fba54619eb02" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="7270" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">{notice}</div>}

      <header className='header' data-buildez-id="be-152146d97bc66b" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="7330" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
        <div className='nav-wrap' data-buildez-id="be-f873c7ea4265f0" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="7366" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
          <button className='menu-button' onClick={() => setMenuOpen(value => !value)} aria-label='Toggle navigation menu' aria-expanded={menuOpen} data-buildez-id="be-a4a5b77cb24949" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="7403" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">
            <Icon name={menuOpen ? 'close' : 'menu'} size={21}/>
          </button>

          <nav className={`main-nav ${menuOpen ? 'open' : ''}`} aria-label='Main navigation' data-buildez-id="be-e470773e9d6fc2" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="7638" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
            <a href='#home' onClick={closeMenu} data-buildez-id="be-a419ee18c5ec2a" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="7734" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">Home <Icon name='chevron' size={12}/></a>
            <a href='#categories' onClick={closeMenu} data-buildez-id="be-bbf4011f4d8727" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="7824" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">Category <Icon name='chevron' size={12}/></a>
            <a href='#sale' onClick={closeMenu} data-buildez-id="be-cd18de41c5ca00" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="7924" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">Offer <Icon name='chevron' size={12}/></a>
            <a href='#journal' onClick={closeMenu} data-buildez-id="be-862c38bed895ae" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="8015" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">Pages <Icon name='chevron' size={12}/></a>
            <a href='#products' onClick={closeMenu} data-buildez-id="be-3d4af5dfcfcd87" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="8109" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">Shop <Icon name='chevron' size={12}/></a>
          </nav>

          <a className='logo' href='#home' aria-label='Sunlit Meadows home' data-buildez-id="be-528530adc44d03" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="8219" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5"><span data-buildez-id="be-76fb485d56ddeb" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="8285" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">Sunlit</span> Meadows</a>

          <div className='header-actions' data-buildez-id="be-839e1e0e180c54" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="8328" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
            <a className='contact-link' href='#footer' data-buildez-id="be-c1034752e6e760" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="8373" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">Contact</a>
            <button aria-label='Search' data-buildez-id="be-1863a1d73d4538" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="8440" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5"><Icon name='search' size={17}/></button>
            <button aria-label='Account' data-buildez-id="be-bad3ab1b5852d3" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="8521" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5"><Icon name='user' size={17}/></button>
            <button className='bag-button' aria-label={`Shopping bag with ${cartCount} items`} data-buildez-id="be-2fe129cca7760a" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="8601" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">
              <Icon name='bag' size={17}/>
              {cartCount > 0 && <span data-buildez-id="be-573fee6b3bee90" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="8760" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      <main data-buildez-id="be-13503285a8b4bd" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="8863" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
        <section className='hero' id='home' data-buildez-id="be-70f3b2f6c6bdbb" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="8878" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
          <div className='hero-shade' data-buildez-id="be-29d5c687122b8f" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="8925" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5"/>
          <div className='hero-content container' data-buildez-id="be-a18d06210a1639" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="8965" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
            <h1 data-buildez-id="be-8c8c13e4063b0a" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="9018" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">View new beauty arrivals of skincare</h1>
            <p data-buildez-id="be-466f66d33c3461" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="9076" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">Discover the combination of science and luxury in every product. Our newest collection is designed to give skin radiance.</p>
            <a className='pill light-button' href='#products' data-buildez-id="be-1e12721371845a" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="9217" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">Shop Now</a>
          </div>
        </section>

        <section className='product-section' id='products' data-buildez-id="be-d8732c45a285e8" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="9325" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
          <div className='container' data-buildez-id="be-4e8f5dd1fcb0cd" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="9387" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
            <div className='product-heading' data-buildez-id="be-8a3c796e3acb8a" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="9427" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
              <span aria-hidden='true' data-buildez-id="be-75ce9a7df44125" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="9475" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5"/>
              <h2 data-buildez-id="be-d8456b63672726" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="9516" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">New Arrivals</h2>
              <div className='carousel-buttons' data-buildez-id="be-fab366ece7d552" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="9552" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
                <button onClick={() => scrollProducts(newProductsRef, -1)} aria-label='Previous new products' data-buildez-id="be-a22f4f9ab35add" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="9603" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">‹</button>
                <button onClick={() => scrollProducts(newProductsRef, 1)} aria-label='Next new products' data-buildez-id="be-d7ccee53e1621f" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="9724" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">›</button>
              </div>
            </div>
            <div className='product-grid' ref={newProductsRef} data-buildez-id="be-0af4558aca4064" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="9876" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
              {newProducts.map(product => <ProductCard key={product.title} product={product} onAdd={addToCart}/>)}
            </div>
          </div>
        </section>

        <section className='categories' id='categories' data-buildez-id="be-9ae54e7cb8b0db" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="10107" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
          <div className='category-photo' data-buildez-id="be-062f05bddfda08" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="10166" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
            <img src='https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1400&q=90' alt='Woman holding a skincare serum' loading='lazy' data-buildez-id="be-8e0373869ee5ba" data-buildez-kind="image" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="10211" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,image,accessibility" data-buildez-revision="5"/>
          </div>
          <div className='category-content' data-buildez-id="be-12b546c5d28177" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="10397" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
            <p className='eyebrow' data-buildez-id="be-b055ffddd7bc8d" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="10444" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">Categories</p>
            <div className='category-intro' data-buildez-id="be-4786f864f6e955" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="10494" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
              <h2 data-buildez-id="be-77534e5673ccd4" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="10541" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">Skin care</h2>
              <p data-buildez-id="be-bdbf8a99fa2174" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="10574" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">Daily essentials for clean, hydrated, and radiant skin.</p>
            </div>
            <a href='#products' data-buildez-id="be-2c31e45e1a4857" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="10668" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">Body products</a>
            <a href='#sale' data-buildez-id="be-3054b0c5732cbf" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="10718" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">Anti-aging care</a>
            <a href='#products' data-buildez-id="be-5009e172c75e8b" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="10766" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">Organic products</a>
            <a className='pill dark category-button' href='#products' data-buildez-id="be-7ca26066d70cc0" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="10819" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">All Products</a>
          </div>
          <img className='category-detail' src='https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=500&q=85' alt='Skincare application detail' loading='lazy' data-buildez-id="be-86301aae22c3f0" data-buildez-kind="image" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="10921" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,image,accessibility" data-buildez-revision="5"/>
        </section>

        <section className='about container' id='about' data-buildez-id="be-60df92fcfbd7e4" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="11132" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
          <p className='eyebrow' data-buildez-id="be-226362aaa95dff" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="11191" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">About us</p>
          <h2 data-buildez-id="be-7daef66e854c54" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="11237" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">We strive to help every woman reveal<br data-buildez-id="be-d845290e61d5ab" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="11277" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5"/>her skin’s natural radiance by selecting<br data-buildez-id="be-9a31417bd8c25c" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="11323" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5"/>only the best from around the world.</h2>
          <div className='value-grid' data-buildez-id="be-a21e76c298b7e9" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="11381" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
            <article data-buildez-id="be-42b0085170f337" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="11422" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
              <div className='value-icon' data-buildez-id="be-b303426372dc20" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="11446" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5"><Icon name='bottle'/></div>
              <h3 data-buildez-id="be-af3a15f36275d5" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="11516" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">Pure ingredients</h3>
              <p data-buildez-id="be-31164fe67f6bf6" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="11556" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">Only clean, safe, and carefully selected components to protect your skin and health.</p>
            </article>
            <article data-buildez-id="be-7de3971e6744e9" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="11683" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
              <div className='value-icon' data-buildez-id="be-f0caf988f9da57" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="11707" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5"><Icon name='seal'/></div>
              <h3 data-buildez-id="be-0d3d0edcbd37aa" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="11775" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">Dermatologist approved</h3>
              <p data-buildez-id="be-638d7a8dc787cf" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="11821" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">Every product is tested and recommended by experts for visible and lasting results.</p>
            </article>
            <article data-buildez-id="be-d2f9de5081a8a3" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="11947" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
              <div className='value-icon' data-buildez-id="be-068b2f5b1bcfb2" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="11971" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5"><Icon name='leaf'/></div>
              <h3 data-buildez-id="be-067f0593bf1c28" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="12039" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">Sustainable beauty</h3>
              <p data-buildez-id="be-a5e7ac0d8939bf" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="12081" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">Eco-friendly packaging and cruelty-free formulas for conscious self-care.</p>
            </article>
          </div>
        </section>

        <section className='bestseller' data-buildez-id="be-7e63a7af71d47f" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="12230" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
          <div className='bestseller-overlay' data-buildez-id="be-9a290c9727a8d1" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="12273" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5"/>
          <div className='bestseller-copy' data-buildez-id="be-d9617b3cdd356e" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="12321" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
            <h2 data-buildez-id="be-8d9911ac282a3a" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="12367" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">Bestsellers</h2>
            <p data-buildez-id="be-6c6e844f6f419d" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="12400" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">See the combination of science and luxury in every product. Our collection is designed to give skin radiance.</p>
            <a className='pill light-button' href='#sale' data-buildez-id="be-7474e262605341" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="12529" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">Shop now</a>
          </div>
          <button className='hotspot hot-one' onClick={() => addToCart('Botanical renewal serum')} aria-label='Add botanical renewal serum' data-buildez-id="be-eee553cb010521" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="12615" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">+</button>
          <button className='hotspot hot-two' onClick={() => addToCart('Restorative face oil')} aria-label='Add restorative face oil' data-buildez-id="be-a95f568e4a8fc7" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="12766" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">+</button>
          <button className='hotspot hot-three' onClick={() => addToCart('Daily barrier cream')} aria-label='Add daily barrier cream' data-buildez-id="be-b5f2e463d99dfe" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="12911" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">+</button>
        </section>

        <section className='product-section sale-section' id='sale' data-buildez-id="be-8348e63f38f4cf" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="13074" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
          <div className='container' data-buildez-id="be-c8fca892c5ac3b" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="13145" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
            <div className='product-heading' data-buildez-id="be-b4c8fe6b8c76e5" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="13185" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
              <span aria-hidden='true' data-buildez-id="be-e9962e8ef87e6c" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="13233" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5"/>
              <h2 data-buildez-id="be-c6b93274e31fcb" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="13274" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">Sale</h2>
              <div className='carousel-buttons' data-buildez-id="be-0c8a6fcc0c5587" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="13302" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
                <button onClick={() => scrollProducts(saleProductsRef, -1)} aria-label='Previous sale products' data-buildez-id="be-0fb4a8acbe1fcf" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="13353" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">‹</button>
                <button onClick={() => scrollProducts(saleProductsRef, 1)} aria-label='Next sale products' data-buildez-id="be-b4e012e4568cd2" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="13476" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">›</button>
              </div>
            </div>
            <div className='product-grid' ref={saleProductsRef} data-buildez-id="be-2a50b11851fd61" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="13630" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
              {saleProducts.map(product => <ProductCard key={product.title} product={product} onAdd={addToCart}/>)}
            </div>
          </div>
        </section>

        <section className='testimonial' data-buildez-id="be-df7574ca6a06c5" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="13863" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
          <div className='testimonial-copy' data-buildez-id="be-29de7db71ee1e1" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="13907" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
            <p className='eyebrow' data-buildez-id="be-49915c436a0be7" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="13954" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">Testimonials</p>
            <div className='customer' data-buildez-id="be-b238c80da3d098" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="14006" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
              <img src='https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=85' alt='Ashley' loading='lazy' data-buildez-id="be-133d65f5168f45" data-buildez-kind="image" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="14047" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,image,accessibility" data-buildez-revision="5"/>
              <div data-buildez-id="be-f98331c981358c" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="14195" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5"><strong data-buildez-id="be-c92e54ba74f484" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="14200" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">Ashley</strong><span data-buildez-id="be-b4b930dcdba133" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="14223" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">★ 4.5</span></div>
            </div>
            <blockquote data-buildez-id="be-c498784a6383e3" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="14279" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">“I’ve been using this cream for three weeks now, and the results are simply amazing. My skin has become more moisturized, supple, and radiant. The texture is light, absorbs quickly, and doesn’t leave a greasy shine.”</blockquote>
          </div>
          <div className='testimonial-photo' data-buildez-id="be-8db714813cf82c" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="14548" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
            <img src='https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=1500&q=90' alt='Woman applying face cream' loading='lazy' data-buildez-id="be-8bfc1cd65c74a4" data-buildez-kind="image" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="14596" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,image,accessibility" data-buildez-revision="5"/>
            <div className='floating-product' data-buildez-id="be-c0939b37c1b559" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="14762" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
              <img src='https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=85' alt='Snail smart serum' loading='lazy' data-buildez-id="be-5fd9b91425f916" data-buildez-kind="image" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="14811" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,image,accessibility" data-buildez-revision="5"/>
              <strong data-buildez-id="be-a73fcb5f7ecdc6" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="14970" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">Snail smart serum</strong>
              <div data-buildez-id="be-456f8974106251" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="15019" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5"><span data-buildez-id="be-3246276ef5ed70" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="15024" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">$72.00</span><span className='stars' data-buildez-id="be-41c0ca05023532" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="15043" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">★★★★★</span></div>
            </div>
          </div>
        </section>

        <section className='blog container' id='journal' data-buildez-id="be-9bf4dd24e9b329" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="15150" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
          <h2 data-buildez-id="be-695afc510d1fe9" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="15210" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">Blog</h2>
          <div className='blog-grid' data-buildez-id="be-d6ce2ad1a3fc8d" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="15234" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
            {blogPosts.map(post => (<article key={post.title} data-buildez-id="be-11af42c29d7006" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="15298" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
                <a className='blog-image' href='#footer' aria-label={post.title} data-buildez-id="be-8cefeec06422af" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="15341" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">
                  <img src={post.image} alt={post.title} loading='lazy' data-buildez-id="be-36785a39be875a" data-buildez-kind="image" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="15425" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,image,accessibility" data-buildez-revision="5"/>
                </a>
                <h3 data-buildez-id="be-0049e8cf70bb06" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="15518" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">{post.title}</h3>
                <p data-buildez-id="be-d59ebd13d5a5c4" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="15556" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">{post.text}</p>
                <a className='text-link' href='#footer' data-buildez-id="be-c4b90559e917e7" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="15591" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">Read more</a>
              </article>))}
          </div>
        </section>

        <section className='subscribe-section' data-buildez-id="be-c9c89b90299cd0" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="15718" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
          <div className='subscribe-card' data-buildez-id="be-0662c8aba1f6c5" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="15768" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
            <h2 data-buildez-id="be-e8859be9ef647e" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="15813" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">Subscribe to get<br data-buildez-id="be-06875e68b944b2" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="15833" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5"/><em data-buildez-id="be-2d17effbd29e6d" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="15839" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">-10% off</em></h2>
            <p data-buildez-id="be-26762b0fa0f25d" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="15874" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">Stay updated with new arrivals, beauty tips, and exclusive offers — plus enjoy 10% off your first order.</p>
            <form onSubmit={subscribe} data-buildez-id="be-8a157a8d4c8ff5" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="15998" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
              <input type='email' name='email' aria-label='Email address' placeholder='Email' required data-buildez-id="be-eb65a6975d376e" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="16040" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5"/>
              <button className='pill dark' type='submit' data-buildez-id="be-63d2c0cebf6949" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="16145" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">Subscribe</button>
            </form>
          </div>
        </section>
      </main>

      <footer id='footer' data-buildez-id="be-68923f26f1580e" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="16285" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
        <div className='footer-main container' data-buildez-id="be-d6545c6da8c509" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="16314" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
          <div className='footer-brand' data-buildez-id="be-575b1025f71007" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="16364" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
            <a className='footer-logo' href='#home' data-buildez-id="be-b5c51fd38b7d1b" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="16407" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5"><span data-buildez-id="be-fed10dde66d98f" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="16447" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">Sunlit</span> Meadows</a>
            <p data-buildez-id="be-05be0bc7f536c4" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="16491" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">We strive to help every woman reveal her skin’s natural radiance by selecting only the best from around the world.</p>
            <div className='socials' data-buildez-id="be-7226014ac6364b" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="16625" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
              <a href='#footer' aria-label='Instagram' data-buildez-id="be-1c8f4964262d00" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="16665" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">◎</a>
              <a href='#footer' aria-label='Facebook' data-buildez-id="be-7a9074cc3968d6" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="16726" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">f</a>
              <a href='#footer' aria-label='TikTok' data-buildez-id="be-d1f03b29efa8c8" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="16786" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">♪</a>
            </div>
          </div>
          <div className='footer-links' data-buildez-id="be-7da8c4d929c372" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="16876" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
            <div data-buildez-id="be-a8202118578838" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="16919" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
              <h3 data-buildez-id="be-2cec0d93ceba9b" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="16939" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">Products</h3>
              <a href='#products' data-buildez-id="be-4bc63aa2b5d865" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="16971" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">Shop all</a>
              <a href='#products' data-buildez-id="be-663efb42bd54c8" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="17018" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">Skin care</a>
              <a href='#products' data-buildez-id="be-d53e26e78ef993" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="17066" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">Body products</a>
              <a href='#sale' data-buildez-id="be-110a7875167b30" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="17118" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">Anti-aging care</a>
              <a href='#products' data-buildez-id="be-9d7ac9a5102d4f" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="17168" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">Organic products</a>
            </div>
            <div data-buildez-id="be-176d2d52fb0d17" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="17240" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
              <h3 data-buildez-id="be-04013649bfabe0" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="17260" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">Information</h3>
              <a href='#about' data-buildez-id="be-418ade592db3b2" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="17295" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">About us</a>
              <a href='#journal' data-buildez-id="be-c9eb1005c8bf40" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="17339" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">Blog</a>
              <a href='#footer' data-buildez-id="be-02c53123e05066" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="17381" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">Contact</a>
            </div>
            <div data-buildez-id="be-a04a4913dee347" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="17442" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
              <h3 data-buildez-id="be-39ae8ce74dc892" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="17462" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">More</h3>
              <a href='#footer' data-buildez-id="be-bd8f9a8db5257c" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="17490" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">Privacy policy</a>
              <a href='#footer' data-buildez-id="be-b457e18f15a736" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="17541" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">Terms of service</a>
              <a href='#footer' data-buildez-id="be-76cac8195119e3" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="17594" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="5">Shipping & returns</a>
            </div>
          </div>
        </div>
        <div className='footer-bottom container' data-buildez-id="be-c7af93d5dfd647" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="17694" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
          <span data-buildez-id="be-e84e97d704f5a4" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="17746" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">© All rights reserved. Made with care by Sunlit Meadows</span>
          <div className='payments' aria-label='Accepted payment methods' data-buildez-id="be-1fe75947ca6b4d" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="17825" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">
            <b data-buildez-id="be-cdc7dea812bd2e" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="17902" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">VISA</b><b className='mastercard' data-buildez-id="be-2e57846e6b74a4" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="17913" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5">●●</b><b data-buildez-id="be-dfa4ed047ed449" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="17945" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5"><span className='google' data-buildez-id="be-763a7c3d328ce8" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="17948" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="5">G</span> Pay</b><b data-buildez-id="be-bf85cfe68ad55f" data-buildez-kind="element" data-buildez-source-file="src/main.tsx" data-buildez-source-anchor="17989" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="5"> Pay</b>
          </div>
        </div>
      </footer>
    </div>);
}
createRoot(document.getElementById('root')!).render(<React.StrictMode>
    <App />
  </React.StrictMode>);
