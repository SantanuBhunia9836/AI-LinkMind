# LinkSaver API Documentation

Complete REST API reference for LinkSaver Android app integration.

## Base URL

```
Development: http://localhost:3000
Production: https://your-domain.com
```

## Authentication

Currently no authentication required (future: add JWT/OAuth if needed)

## Response Format

All responses follow this format:

```json
{
  "success": true/false,
  "data": { /* response data */ },
  "error": "error message (if success=false)",
  "message": "optional message"
}
```

---

## Endpoints

### 1. Health Check

Check if the API is online and responsive.

**Endpoint**: `GET /api/health`

**Response**:
```json
{
  "success": true,
  "message": "LinkSaver API is healthy",
  "version": "1.0.0",
  "timestamp": "2025-11-15T10:30:00Z"
}
```

**Status Code**: 200

**Example (cURL)**:
```bash
curl -X GET http://localhost:3000/api/health
```

**Example (Kotlin)**:
```kotlin
val client = OkHttpClient()
val request = Request.Builder()
    .url("http://localhost:3000/api/health")
    .get()
    .build()
    
client.newCall(request).execute().use { response ->
    val body = response.body?.string()
    Log.d("Health", body ?: "Error")
}
```

---

### 2. Categorize Link

Use AI to analyze and categorize a video link.

**Endpoint**: `POST /api/categorize`

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Response (Success - Confidence >= 80%)**:
```json
{
  "success": true,
  "data": {
    "title": "Rick Astley - Never Gonna Give You Up",
    "description": "Official Rick Astley Music Video",
    "category": "Music",
    "confidence": 0.95,
    "creatorName": "Rick Astley",
    "thumbnailUrl": "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
  }
}
```

**Response (Low Confidence - <80%)**:
```json
{
  "success": true,
  "data": {
    "title": "...",
    "description": "...",
    "category": "Entertainment",
    "confidence": 0.65,
    "creatorName": "...",
    "thumbnailUrl": "..."
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Invalid URL provided"
}
```

**Status Codes**: 
- 200: Success
- 400: Invalid URL
- 500: Server error

**Example (Kotlin)**:
```kotlin
fun categorizeLink(url: String) {
    val client = OkHttpClient()
    val json = JSONObject().put("url", url)
    
    val requestBody = RequestBody.create(
        MediaType.parse("application/json"),
        json.toString()
    )
    
    val request = Request.Builder()
        .url("http://localhost:3000/api/categorize")
        .post(requestBody)
        .build()
    
    client.newCall(request).execute().use { response ->
        if (response.isSuccessful) {
            val body = response.body?.string()
            val jsonResponse = JSONObject(body)
            
            if (jsonResponse.getBoolean("success")) {
                val data = jsonResponse.getJSONObject("data")
                val category = data.getString("category")
                val confidence = data.getDouble("confidence")
                
                if (confidence >= 0.8) {
                    // Auto-save with confidence
                    saveLink(data)
                } else {
                    // Prompt user to select category
                    showCategoryDialog(data)
                }
            }
        }
    }
}
```

---

### 3. Get Links

Retrieve all saved links from the server.

**Endpoint**: `GET /api/links`

**Query Parameters** (Optional):
- `category`: Filter by category
- `limit`: Maximum number of links to return
- `offset`: Pagination offset

**Response**:
```json
{
  "success": true,
  "links": [
    {
      "id": "uuid-string",
      "url": "https://www.youtube.com/watch?v=...",
      "title": "Video Title",
      "description": "Video description",
      "category": "Music",
      "creatorName": "Creator Name",
      "thumbnailUrl": "https://...",
      "createdAt": "2025-11-15T10:30:00Z"
    }
  ],
  "message": "Links retrieved successfully"
}
```

**Status Code**: 200

**Example (Kotlin)**:
```kotlin
fun getLinks() {
    val client = OkHttpClient()
    val request = Request.Builder()
        .url("http://localhost:3000/api/links")
        .get()
        .build()
    
    client.newCall(request).execute().use { response ->
        if (response.isSuccessful) {
            val jsonResponse = JSONObject(response.body?.string())
            val linksArray = jsonResponse.getJSONArray("links")
            
            for (i in 0 until linksArray.length()) {
                val link = linksArray.getJSONObject(i)
                val title = link.getString("title")
                val category = link.getString("category")
                
                // Process link
                addToDatabase(link)
            }
        }
    }
}
```

---

### 4. Save Link

Save a new link to the server.

**Endpoint**: `POST /api/links`

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "url": "https://www.youtube.com/watch?v=...",
  "title": "Video Title",
  "description": "Video description",
  "category": "Music",
  "creatorName": "Creator Name",
  "thumbnailUrl": "https://img.youtube.com/vi/.../hqdefault.jpg"
}
```

**Required Fields**: `url`, `title`, `category`  
**Optional Fields**: `description`, `creatorName`, `thumbnailUrl`

**Response**:
```json
{
  "success": true,
  "message": "Link saved successfully",
  "link": {
    "id": "generated-uuid",
    "url": "...",
    "title": "...",
    "description": "...",
    "category": "...",
    "creatorName": "...",
    "thumbnailUrl": "...",
    "createdAt": "2025-11-15T10:30:00Z"
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Missing required fields: url, title, category"
}
```

**Status Codes**:
- 200: Success
- 400: Missing/invalid fields
- 500: Server error

**Example (Kotlin)**:
```kotlin
fun saveLink(data: JSONObject) {
    val client = OkHttpClient()
    
    val body = JSONObject()
        .put("url", data.getString("url"))
        .put("title", data.getString("title"))
        .put("description", data.getString("description"))
        .put("category", data.getString("category"))
        .put("creatorName", data.getString("creatorName"))
        .put("thumbnailUrl", data.getString("thumbnailUrl"))
    
    val requestBody = RequestBody.create(
        MediaType.parse("application/json"),
        body.toString()
    )
    
    val request = Request.Builder()
        .url("http://localhost:3000/api/links")
        .post(requestBody)
        .build()
    
    client.newCall(request).execute().use { response ->
        if (response.isSuccessful) {
            val jsonResponse = JSONObject(response.body?.string())
            if (jsonResponse.getBoolean("success")) {
                Toast.makeText(context, "Link saved!", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
```

---

### 5. Get Statistics

Retrieve statistics about saved links.

**Endpoint**: `GET /api/stats`

**Response**:
```json
{
  "success": true,
  "stats": {
    "totalLinks": 42,
    "categories": 8,
    "creators": 25,
    "topCategory": "Music",
    "topCreator": "Top Creator Name"
  },
  "message": "Statistics retrieved successfully"
}
```

**Status Code**: 200

**Example (Kotlin)**:
```kotlin
fun getStats() {
    val client = OkHttpClient()
    val request = Request.Builder()
        .url("http://localhost:3000/api/stats")
        .get()
        .build()
    
    client.newCall(request).execute().use { response ->
        if (response.isSuccessful) {
            val jsonResponse = JSONObject(response.body?.string())
            val stats = jsonResponse.getJSONObject("stats")
            
            val totalLinks = stats.getInt("totalLinks")
            val topCategory = stats.getString("topCategory")
            
            // Update UI with stats
            updateStatsUI(totalLinks, topCategory)
        }
    }
}
```

---

## Implementation Guide for Android

### Setup (build.gradle.kts)

```kotlin
dependencies {
    implementation "com.squareup.okhttp3:okhttp:4.11.0"
    implementation "com.google.code.gson:gson:2.10.1"
}
```

### Complete Example

```kotlin
class LinkSaverAPI {
    private val client = OkHttpClient()
    private val gson = Gson()
    private val baseUrl = "http://192.168.1.100:3000" // Use actual server IP
    
    fun categorizeLinkFromShare(url: String, callback: (Result) -> Unit) {
        try {
            if (!isValidUrl(url)) {
                callback(Result.Error("Invalid URL"))
                return
            }
            
            val json = JSONObject().put("url", url)
            val body = RequestBody.create(
                MediaType.parse("application/json"),
                json.toString()
            )
            
            val request = Request.Builder()
                .url("$baseUrl/api/categorize")
                .post(body)
                .build()
            
            client.newCall(request).enqueue(object : Callback {
                override fun onFailure(call: Call, e: IOException) {
                    callback(Result.Error(e.message ?: "Network error"))
                }
                
                override fun onResponse(call: Call, response: Response) {
                    try {
                        val body = response.body?.string()
                        val jsonResponse = JSONObject(body)
                        
                        if (jsonResponse.getBoolean("success")) {
                            val data = jsonResponse.getJSONObject("data")
                            val result = LinkData(
                                title = data.getString("title"),
                                description = data.getString("description"),
                                category = data.getString("category"),
                                confidence = data.getDouble("confidence"),
                                creatorName = data.getString("creatorName"),
                                thumbnailUrl = data.getString("thumbnailUrl"),
                                url = url
                            )
                            callback(Result.Success(result))
                        } else {
                            callback(Result.Error(jsonResponse.optString("error", "Unknown error")))
                        }
                    } catch (e: Exception) {
                        callback(Result.Error(e.message ?: "Parse error"))
                    }
                }
            })
        } catch (e: Exception) {
            callback(Result.Error(e.message ?: "Unknown error"))
        }
    }
    
    private fun isValidUrl(url: String): Boolean {
        return url.startsWith("http://") || url.startsWith("https://")
    }
    
    sealed class Result {
        data class Success(val data: LinkData) : Result()
        data class Error(val message: String) : Result()
    }
    
    data class LinkData(
        val title: String,
        val description: String,
        val category: String,
        val confidence: Double,
        val creatorName: String,
        val thumbnailUrl: String,
        val url: String
    )
}
```

### Usage

```kotlin
val api = LinkSaverAPI()

// In your Share Intent handler
val sharedUrl = intent.getStringExtra("android.intent.extra.TEXT")
api.categorizeLinkFromShare(sharedUrl) { result ->
    when (result) {
        is LinkSaverAPI.Result.Success -> {
            val link = result.data
            if (link.confidence >= 0.8) {
                // Save directly
                saveLinkToDatabase(link)
            } else {
                // Show category selection dialog
                showCategoryDialog(link)
            }
        }
        is LinkSaverAPI.Result.Error -> {
            Toast.makeText(this, result.message, Toast.LENGTH_SHORT).show()
        }
    }
}
```

---

## Error Handling

### Common Errors

| Status | Error | Solution |
|--------|-------|----------|
| 400 | Invalid URL | Check URL format (must start with http:// or https://) |
| 400 | Missing required fields | Ensure all required fields are in request body |
| 500 | Server error | Check server logs, retry in 30 seconds |
| Network timeout | No response | Verify server is running, check network connection |

### Retry Strategy

```kotlin
fun retryRequest(maxRetries: Int = 3, delayMs: Long = 1000) {
    var attempts = 0
    while (attempts < maxRetries) {
        try {
            // Make request
            break
        } catch (e: Exception) {
            attempts++
            if (attempts < maxRetries) {
                Thread.sleep(delayMs * attempts)
            }
        }
    }
}
```

---

## Best Practices

1. **Always validate URLs** before sending to API
2. **Implement retry logic** for network failures
3. **Cache responses** to reduce server load
4. **Use confidence score** to decide between auto-save and user selection
5. **Handle offline mode** gracefully (save locally, sync when online)
6. **Set reasonable timeouts** (30 seconds for API calls)
7. **Use compression** for requests/responses if needed
8. **Log all API interactions** for debugging

---

## Testing

### cURL Examples

```bash
# Health check
curl -X GET http://localhost:3000/api/health

# Categorize
curl -X POST http://localhost:3000/api/categorize \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'

# Get links
curl -X GET http://localhost:3000/api/links

# Save link
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{
    "url":"https://youtube.com/watch?v=abc",
    "title":"Test Video",
    "category":"Music",
    "creatorName":"Test Creator",
    "description":"Test description"
  }'

# Get stats
curl -X GET http://localhost:3000/api/stats
```

---

## Monitoring

Monitor these metrics for production:
- API response times (target: <2s)
- Error rates (target: <1%)
- Cache hit rates
- Concurrent users
- Database load

---

**API Version**: 1.0  
**Last Updated**: November 15, 2025  
**Status**: Production Ready ✅
