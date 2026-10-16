async function testViteProxy() {
  try {
    const res = await fetch('http://localhost:5173/ollama/api/tags');
    const data = await res.json();
    console.log('Proxy test success! Models through Vite:', data.models.map(m => m.name));
  } catch (err) {
    console.error('Proxy test failed:', err.message);
  }
}
testViteProxy();
