const token = "EAAPjyRQqGfgBStxWsgvcZAX388QEZA71LPJJuKlZBtsZCpC9MAQH9CfBEiVwiNWs9MqfsKhPOqToIHKsW4gNi4lIHtTaShaZBdfqLQlkAdsNVZC4Irw2ZCdg8JrnZCpTnZAbFdBy3J8Rttte4az4kknzZBUa4AxA1KMSKcLhhpZAB98wS2YV5gfNEfllmGcZAffLToZASzvyxfX35";
const pageId = "1298528889999581";
const igId = "17841422785818021";

async function testMeta() {
  console.log('Testing Meta Token Debug...');
  const debugRes = await fetch(`https://graph.facebook.com/v21.0/debug_token?input_token=${token}&access_token=${token}`);
  const debugData = await debugRes.json();
  console.log('Token Debug:', JSON.stringify(debugData, null, 2));

  console.log('\nTesting Page Conversations...');
  const convRes = await fetch(`https://graph.facebook.com/v21.0/${pageId}/conversations?fields=id,snippet,updated_time,unread_count,senders&access_token=${token}`);
  const convData = await convRes.json();
  console.log('Conversations:', JSON.stringify(convData, null, 2));

  console.log('\nTesting Instagram Conversations...');
  const igConvRes = await fetch(`https://graph.facebook.com/v21.0/${igId}/conversations?fields=id,snippet,updated_time,unread_count&access_token=${token}`);
  const igConvData = await igConvRes.json();
  console.log('IG Conversations:', JSON.stringify(igConvData, null, 2));
}

testMeta().catch(console.error);
