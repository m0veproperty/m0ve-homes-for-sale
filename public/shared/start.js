// Keep shared modules as independent, same-origin assets in both static and Vite builds.
import('/shared/frontend.js').catch(error=>console.warn('M0VE shared frontend could not load:',error.message));
