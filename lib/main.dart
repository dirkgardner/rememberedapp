import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:google_generative_ai/google_generative_ai.dart';
import 'package:url_launcher/url_launcher.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Supabase Initialisierung
  await Supabase.initialize(
    url: 'https://aahsaqygohmykhagbihk.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhaHNhcXlnb2hteWtoYWdiaWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwODQzMDcsImV4cCI6MjA4MjY2MDMwN30.yRGsxsWC9EGO5rR1cy4_9Clt6FvJ05cqRo9qHlVyE-E',
  );
  runApp(const RememberedApp());
}

class RememberedApp extends StatelessWidget {
  const RememberedApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Remembered',
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF050505), // Ultra Dark Background
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.amberAccent, brightness: Brightness.dark),
        appBarTheme: const AppBarTheme(backgroundColor: Colors.transparent, elevation: 0),
      ),
      home: const IconGridPage(),
    );
  }
}

// --- GRID PAGE (ÜBERSICHT) ---
class IconGridPage extends StatefulWidget {
  const IconGridPage({super.key});
  @override
  State<IconGridPage> createState() => _IconGridPageState();
}

class _IconGridPageState extends State<IconGridPage> {
  final supabase = Supabase.instance.client;
  String searchQuery = "";
  bool isSearching = false;

  // HIER IST JETZT DER RICHTIGE LINK DRIN:
  final String logoUrl = "https://aahsaqygohmykhagbihk.supabase.co/storage/v1/object/public/assets/logo.png"; 

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        // Logo + REMEMBERED Text
        title: isSearching 
            ? TextField(
                style: const TextStyle(color: Colors.white),
                cursorColor: Colors.amberAccent,
                onChanged: (v) => setState(() => searchQuery = v), 
                decoration: const InputDecoration(hintText: 'Suche Legende...', border: InputBorder.none, hintStyle: TextStyle(color: Colors.white38)),
                autofocus: true,
              )
            : Row(
                children: [
                  Image.network(
                    logoUrl, 
                    height: 32, 
                    fit: BoxFit.contain,
                    errorBuilder: (c, o, s) => const Icon(Icons.broken_image, color: Colors.white54),
                  ),
                  const SizedBox(width: 12),
                  // JETZT STEHT HIER DER RICHTIGE NAME:
                  const Text('REMEMBERED', style: TextStyle(letterSpacing: 2, fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white)),
                ],
              ),
        actions: [
          IconButton(
            icon: Icon(isSearching ? Icons.close : Icons.search, color: Colors.white), 
            onPressed: () => setState(() {
              isSearching = !isSearching;
              if (!isSearching) searchQuery = "";
            })
          )
        ],
      ),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: supabase.from('icons').select(),
        builder: (context, snapshot) {
          if (!snapshot.hasData) return const Center(child: CircularProgressIndicator(color: Colors.amberAccent));
          
          final items = snapshot.data!.where((i) {
            return i['name'].toString().toLowerCase().contains(searchQuery.toLowerCase());
          }).toList();
          
          return GridView.builder(
            padding: const EdgeInsets.fromLTRB(16, 120, 16, 16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2, 
              crossAxisSpacing: 16, 
              mainAxisSpacing: 16, 
              childAspectRatio: 0.7
            ),
            itemCount: items.length,
            itemBuilder: (context, index) => GestureDetector(
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (c) => LandingPage(iconData: items[index]))),
              child: Hero(
                tag: 'hero-${items[index]['name']}',
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.5), blurRadius: 10, offset: const Offset(0, 5))],
                    image: DecorationImage(
                      image: NetworkImage(items[index]['profile_image_url'] ?? ''), 
                      fit: BoxFit.cover,
                    ),
                  ),
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(24), 
                      gradient: LinearGradient(
                        begin: Alignment.topCenter, 
                        end: Alignment.bottomCenter, 
                        colors: [Colors.transparent, Colors.black.withOpacity(0.9)]
                      )
                    ),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.end, 
                      crossAxisAlignment: CrossAxisAlignment.start, 
                      children: [
                        Text(items[index]['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.white)),
                        Text(items[index]['category']?.toUpperCase() ?? '', style: const TextStyle(color: Colors.amberAccent, fontSize: 10, letterSpacing: 1.5)),
                      ]
                    ),
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

// --- LANDING PAGE (DETAIL) ---
class LandingPage extends StatefulWidget {
  final Map<String, dynamic> iconData;
  const LandingPage({super.key, required this.iconData});
  @override
  State<LandingPage> createState() => _LandingPageState();
}

class _LandingPageState extends State<LandingPage> {
  final supabase = Supabase.instance.client;
  String aiFact = "Wissen wird geladen...";
  int candleCount = 0;
  bool hasLitCandle = false;

  @override
  void initState() {
    super.initState();
    _initData();
  }

  Future<void> _initData() async {
    try {
      final model = GenerativeModel(model: 'gemini-1.5-flash', apiKey: 'AIzaSyDw8lcCu0wFHPEt7rx5VhmzXvCmqaAlnQ4');
      final prompt = "Ein respektvoller, epischer Satz über das Vermächtnis von ${widget.iconData['name']}. Max 15 Wörter.";
      
      final response = await model.generateContent([Content.text(prompt)]);
      
      if (mounted) {
        setState(() => aiFact = response.text?.trim() ?? "Eine Legende, die niemals verblasst.");
      }
    } catch (e) {
      if (mounted) setState(() => aiFact = "Eine Legende, die niemals verblasst.");
    }

    try {
      final data = await supabase.from('icons').select('candles').eq('id', widget.iconData['id']).single();
      if (mounted) {
        setState(() => candleCount = data['candles'] ?? 0);
      }
    } catch (e) {}
  }

  Future<void> _lightCandle() async {
    if (hasLitCandle) return; 
    
    setState(() {
      hasLitCandle = true;
      candleCount++; 
    });

    try {
      await supabase.from('icons').update({'candles': candleCount}).eq('id', widget.iconData['id']);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Eine Kerze für die Ewigkeit entzündet. 🔥"), backgroundColor: Colors.amber),
        );
      }
    } catch (e) {}
  }

  @override
  Widget build(BuildContext context) {
    final icon = widget.iconData;
    final videoId = (icon['header_video_url'] != null && icon['header_video_url'].toString().length > 5) 
        ? icon['header_video_url'] 
        : 'AuYmKbtnmEA';
    final thumbUrl = "https://img.youtube.com/vi/$videoId/hqdefault.jpg";

    return Scaffold(
      backgroundColor: const Color(0xFF050505),
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 450,
            pinned: true,
            backgroundColor: const Color(0xFF050505),
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  Hero(tag: 'hero-${icon['name']}', child: Image.network(icon['profile_image_url'] ?? '', fit: BoxFit.cover)),
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [Colors.transparent, const Color(0xFF050505).withOpacity(0.9), const Color(0xFF050505)],
                        stops: const [0.5, 0.8, 1.0],
                      ),
                    ),
                  ),
                ],
              ),
              title: Text(icon['name'].toString().toUpperCase(), style: const TextStyle(fontWeight: FontWeight.w900, letterSpacing: 3, color: Colors.white)),
              centerTitle: true,
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1A1A1A),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.white10),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text("$candleCount", style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.amberAccent)),
                            const Text("GEDENKKERZEN", style: TextStyle(color: Colors.white54, fontSize: 10, letterSpacing: 1.5)),
                          ],
                        ),
                        ElevatedButton.icon(
                          onPressed: hasLitCandle ? null : _lightCandle,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: hasLitCandle ? Colors.grey.shade900 : Colors.amberAccent,
                            foregroundColor: hasLitCandle ? Colors.white38 : Colors.black,
                            shape: const StadiumBorder(),
                            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                          ),
                          icon: Icon(hasLitCandle ? Icons.check : Icons.local_fire_department_rounded),
                          label: Text(hasLitCandle ? "ENTZÜNDET" : "ANZÜNDEN"),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 30),
                  Text("❝ $aiFact ❞", textAlign: TextAlign.center, style: const TextStyle(fontSize: 20, fontStyle: FontStyle.italic, color: Colors.white70, height: 1.4)),
                  const SizedBox(height: 40),
                  _buildHeader("LEGACY MEDIA"),
                  const SizedBox(height: 20),
                  GestureDetector(
                    onTap: () async {
                      final url = Uri.parse("https://www.youtube.com/watch?v=$videoId");
                      if (await canLaunchUrl(url)) await launchUrl(url);
                    },
                    child: Container(
                      height: 200,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(20),
                        image: DecorationImage(image: NetworkImage(thumbUrl), fit: BoxFit.cover, colorFilter: ColorFilter.mode(Colors.black.withOpacity(0.4), BlendMode.darken)),
                        border: Border.all(color: Colors.white10),
                      ),
                      child: const Center(
                        child: Icon(Icons.play_circle_fill, color: Colors.white, size: 60),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1DB954),
                      minimumSize: const Size(double.infinity, 55),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    onPressed: () async {
                      final url = Uri.parse(icon['spotify_url'] ?? 'https://spotify.com');
                      if (await canLaunchUrl(url)) await launchUrl(url);
                    },
                    icon: const Icon(Icons.music_note, color: Colors.white),
                    label: const Text("AUF SPOTIFY HÖREN", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                  ),
                  const SizedBox(height: 80),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(String title) {
    return Row(children: [
      Container(width: 4, height: 18, color: Colors.amberAccent),
      const SizedBox(width: 10),
      Text(title, style: const TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.5, color: Colors.white54)),
    ]);
  }
}