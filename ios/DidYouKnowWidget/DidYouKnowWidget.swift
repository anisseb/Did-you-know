import WidgetKit
import SwiftUI
import Intents

struct AnecdoteEntry: TimelineEntry {
    let date: Date
    let anecdote: String
    let category: String
    let configuration: ConfigurationIntent
}

struct Provider: IntentTimelineProvider {
    func placeholder(in context: Context) -> AnecdoteEntry {
        AnecdoteEntry(
            date: Date(),
            anecdote: "Les pieuvres ont trois cœurs et du sang bleu.",
            category: "Science",
            configuration: ConfigurationIntent()
        )
    }

    func getSnapshot(for configuration: ConfigurationIntent, in context: Context, completion: @escaping (AnecdoteEntry) -> ()) {
        let entry = AnecdoteEntry(
            date: Date(),
            anecdote: "Les bananes sont techniquement des baies, mais les fraises ne le sont pas.",
            category: "Nature",
            configuration: configuration
        )
        completion(entry)
    }

    func getTimeline(for configuration: ConfigurationIntent, in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        var entries: [AnecdoteEntry] = []
        
        // Récupérer les anecdotes depuis UserDefaults (partagé avec l'app React Native)
        let anecdotes = getAnecdotesFromSharedDefaults(category: configuration.category?.identifier ?? "general")
        let scrollInterval = getScrollIntervalFromSharedDefaults()
        
        // Créer des entrées pour les prochaines heures
        let currentDate = Date()
        for i in 0..<min(anecdotes.count, 20) {
            let entryDate = Calendar.current.date(byAdding: .second, value: i * scrollInterval, to: currentDate)!
            let entry = AnecdoteEntry(
                date: entryDate,
                anecdote: anecdotes[i % anecdotes.count].content,
                category: anecdotes[i % anecdotes.count].category,
                configuration: configuration
            )
            entries.append(entry)
        }

        let timeline = Timeline(entries: entries, policy: .atEnd)
        completion(timeline)
    }
}

struct AnecdoteWidgetEntryView : View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Arrière-plan avec dégradé
                LinearGradient(
                    gradient: Gradient(colors: [
                        Color(red: 0.08, green: 0.02, blue: 0.12), // #15061e
                        Color(red: 0.12, green: 0.06, blue: 0.20)
                    ]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                
                VStack(alignment: .leading, spacing: 8) {
                    // En-tête avec catégorie
                    HStack {
                        Text(entry.category)
                            .font(.caption2)
                            .fontWeight(.semibold)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.white.opacity(0.2))
                            .foregroundColor(.white)
                            .cornerRadius(8)
                        
                        Spacer()
                        
                        Image(systemName: "lightbulb.fill")
                            .foregroundColor(.yellow)
                            .font(.caption)
                    }
                    
                    Spacer()
                    
                    // Contenu de l'anecdote
                    Text(entry.anecdote)
                        .font(family == .systemSmall ? .caption : .body)
                        .fontWeight(.medium)
                        .foregroundColor(.white)
                        .multilineTextAlignment(.leading)
                        .lineLimit(family == .systemSmall ? 4 : 6)
                        .minimumScaleFactor(0.8)
                    
                    Spacer()
                    
                    // Pied de page avec logo
                    HStack {
                        Text("DidYouKnow")
                            .font(.caption2)
                            .fontWeight(.bold)
                            .foregroundColor(.white.opacity(0.8))
                        
                        Spacer()
                        
                        Text(formatDate(entry.date))
                            .font(.caption2)
                            .foregroundColor(.white.opacity(0.6))
                    }
                }
                .padding(family == .systemSmall ? 12 : 16)
            }
        }
    }
    
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"
        return formatter.string(from: date)
    }
}

struct DidYouKnowWidget: Widget {
    let kind: String = "DidYouKnowWidget"

    var body: some WidgetConfiguration {
        IntentConfiguration(kind: kind, intent: ConfigurationIntent.self, provider: Provider()) { entry in
            AnecdoteWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Anecdotes DidYouKnow")
        .description("Découvrez des anecdotes fascinantes qui changent régulièrement.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

// Fonctions utilitaires pour récupérer les données partagées
func getAnecdotesFromSharedDefaults(category: String) -> [(content: String, category: String)] {
    let sharedDefaults = UserDefaults(suiteName: "group.com.anisse3000.didyouknow")
    
    if let data = sharedDefaults?.data(forKey: "anecdotes_cache"),
       let jsonObject = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
       let anecdotesArray = jsonObject["anecdotes"] as? [[String: Any]] {
        
        return anecdotesArray.compactMap { anecdoteDict in
            guard let content = anecdoteDict["content"] as? String,
                  let cat = anecdoteDict["category"] as? String else {
                return nil
            }
            
            // Filtrer par catégorie si spécifiée
            if category != "general" && cat != category {
                return nil
            }
            
            return (content: content, category: cat)
        }
    }
    
    // Anecdotes par défaut si aucune donnée n'est disponible
    return [
        (content: "Les pieuvres ont trois cœurs et du sang bleu.", category: "Science"),
        (content: "La Grande Muraille de Chine n'est pas visible depuis l'espace à l'œil nu.", category: "Histoire"),
        (content: "Les bananes sont techniquement des baies, mais les fraises ne le sont pas.", category: "Nature")
    ]
}

func getScrollIntervalFromSharedDefaults() -> Int {
    let sharedDefaults = UserDefaults(suiteName: "group.com.anisse3000.didyouknow")
    
    if let data = sharedDefaults?.data(forKey: "widget_configuration"),
       let jsonObject = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
       let interval = jsonObject["scrollInterval"] as? Int {
        return interval
    }
    
    return 5 // Valeur par défaut : 5 secondes
}

struct DidYouKnowWidget_Previews: PreviewProvider {
    static var previews: some View {
        AnecdoteWidgetEntryView(entry: AnecdoteEntry(
            date: Date(),
            anecdote: "Les pieuvres ont trois cœurs et du sang bleu.",
            category: "Science",
            configuration: ConfigurationIntent()
        ))
        .previewContext(WidgetPreviewContext(family: .systemSmall))
    }
}