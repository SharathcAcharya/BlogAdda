import AOS from 'aos';
import 'aos/dist/aos.css';

const initializeAOS = () => {
  AOS.init({
    duration: 1000,
    once: true,
    easing: 'ease-in-out',
    offset: 100,
    anchorPlacement: 'top-bottom',
    disable: false,
    startEvent: 'DOMContentLoaded',
    disableMutationObserver: false,
    throttleDelay: 99,
    debounceDelay: 50,
    mirror: false,
  });
};

export default initializeAOS;
