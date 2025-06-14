export default async function Home() {
  const res = await fetch(`${process.env.API_BASE_URL || 'http://localhost:3000/api'}/track`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: 
  })

  const data = await res.json()
  console.log(data)
  return (
    <div>
      <h1>LLM Tracker</h1>
      <p>{data.id}</p>
      <p>{data.timestamp}</p>
      <p>{data.status}</p>
      <p>{data.model}</p>
      <p>{data.prompt_tokens}</p>
      <p>{data.completion_tokens}</p>
    </div>
  )
}
