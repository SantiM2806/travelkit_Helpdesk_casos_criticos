$headers = @{
    "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cXhxeXplcXh5cXJ0bGdwaG54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjY4MzgxMCwiZXhwIjoyMDkyMjU5ODEwfQ.EQ6p1F_VXjhaFIyOubqGW-xOdt8AP_eCrnYx9kWA5_c"
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cXhxeXplcXh5cXJ0bGdwaG54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjY4MzgxMCwiZXhwIjoyMDkyMjU5ODEwfQ.EQ6p1F_VXjhaFIyOubqGW-xOdt8AP_eCrnYx9kWA5_c"
    "Content-Type" = "application/json"
}

$body = @{
    "sql" = "CREATE TABLE IF NOT EXISTS tickets (ticket_id text PRIMARY KEY, timestamp timestamptz NOT NULL, email text NOT NULL, categoria text NOT NULL, prioridad text NOT NULL, descripcion text NOT NULL, estado text NOT NULL DEFAULT 'Abierto', responsable text, area text, created_at timestamptz DEFAULT now())"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://rvqxqyzeqxyqrtlgphnx.supabase.co/rest/v1/rpc/exec_sql" -Method Post -Headers $headers -Body $body
    Write-Host "Response: $($response | ConvertTo-Json)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    $content = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($content)
    $reader.ReadToEnd()
}