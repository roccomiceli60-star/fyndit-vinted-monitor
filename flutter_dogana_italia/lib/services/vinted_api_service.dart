import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/deal_item.dart';

class VintedApiService {
  static const String baseUrl = 'https://api.vinted.it/svc-catalogue/items';

  static Future<List<DealItem>> fetchRealListings({
    String query = '',
    int perPage = 25,
  }) async {
    try {
      final uri = Uri.parse(
        '$baseUrl?search_text=${Uri.encodeComponent(query)}&page=1&per_page=$perPage&order=newest_first',
      );

      final response = await http.get(
        uri,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'it-IT,it;q=0.8',
          'Platform': 'web',
          'x-next-app': 'marketplace-web',
          'Origin': 'https://www.vinted.it',
          'Referer': 'https://www.vinted.it/',
        },
      ).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = json.decode(response.body);
        final List items = data['items'] ?? [];
        return items.map((raw) {
          final price = double.tryParse(raw['price']?['amount']?.toString() ?? '25') ?? 25.0;
          final title = raw['title']?.toString() ?? 'Articolo Vinted';
          final brand = raw['item_box']?['first_line']?.toString() ?? 'Brand';
          final marketVal = price * 2.5;
          final discount = ((marketVal - price) / marketVal * 100).round();

          String img = 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80';
          if (raw['photo'] != null) {
            final thumbs = raw['photo']['thumbnails'] as List?;
            if (thumbs != null && thumbs.length > 2) {
              img = thumbs[2]['url'] ?? img;
            } else {
              img = raw['photo']['full_size_url'] ?? raw['photo']['url'] ?? img;
            }
          }

          return DealItem(
            id: 'vnt-${raw['id']}',
            title: title,
            brand: brand,
            size: 'M',
            condition: 'Ottime condizioni',
            price: price,
            marketValue: marketVal,
            discountPercent: discount,
            sellerUsername: raw['user']?['login']?.toString() ?? 'utente_vinted',
            sellerRating: 4.9,
            sellerCountry: 'Italia',
            sellerFlag: '🇮🇹',
            imageUrl: img,
            vintedUrl: 'https://www.vinted.it${raw['url'] ?? ''}',
            publishedSecondsAgo: 5,
            isSteal: discount >= 50,
          );
        }).toList();
      }
    } catch (_) {}
    return [];
  }
}
