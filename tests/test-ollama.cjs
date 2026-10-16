async function testWarmSpeed() {
  console.log('Testing warm gemma4:e4b latency (think: false)...');
  const start = Date.now();
  const testMessage = "Congratulations! You won 50,000 INR in lottery. Call 9876543210 to claim.";

  const prompt = `Analyze: "${testMessage}". Return JSON: {"isScam":true,"riskScore":95,"category":"Lottery Scam"}`;

  try {
    const res = await fetch('http://127.0.0.1:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma4:e4b',
        prompt: prompt,
        stream: false,
        format: 'json',
        options: {
          num_ctx: 2048,
          temperature: 0.1
        }
      })
    });

    const data = await res.json();
    console.log(`Warm latency: ${((Date.now() - start)/1000).toFixed(2)}s`);
    console.log('Response:', data.response);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testWarmSpeed();
