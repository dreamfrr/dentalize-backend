const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const { nanoid } = require("nanoid");
require('dotenv').config();

const labels = ["Calculus", "Caries", "Gingivitis", "Hypodontia", "Discoloration", "Ulcer", "Healthy"];

async function predict(imgPath, req) {
  const imageBuffer = fs.readFileSync(imgPath);
  let tensor = tf.node.decodeJpeg(imageBuffer)
  .resizeBilinear([150, 150]) // Resize to match model's expected input
  .toFloat()
  .div(255)
  .expandDims();

if (tensor.shape[3] === 4) {
  // Remove the alpha channel if present
  tensor = tensor.slice([0, 0, 0, 0], [-1, -1, -1, 3]);
}

  const prediction = req.model.predict(tensor);
  const score = await prediction.data();
  const confidenceScore = Math.max(...score) * 100;
  const classIdx = score.indexOf(Math.max(...score));
  
  const label= labels[classIdx];

    let explanation = ""; // Initialize explanation
    let cause = "";
    let prevention = "";
    let suggestion = "";

    if (label === 'Calculus') {
        explanation = "Kalkulus gigi, yang lebih dikenal dengan tartar, adalah plak gigi yang mengeras dan menempel pada gigi."
        cause = "Kalkulus gigi, atau karang gigi, merupakan hasil akhir dari plak yang tidak dibersihkan dengan baik. Plak merupakan lapisan tipis dan lengket yang terbentuk dari sisa makanan, yang akan terus menumpuk dan mengeras seiring waktu. Jika plak ini tidak dibersihkan secara rutin, lama kelamaan akan berubah menjadi kalkulus gigi yang keras dan menempel kuat pada permukaan gigi."
        prevention = "Karang gigi bisa dicegah dengan sikat gigi dua kali sehari dengan pasta gigi berfluoride dan floss sekali sehari untuk membersihkan sisa makanan dan plak. Kurangi makanan manis dan rokok, dua musuh utama kesehatan gigi. Jangan lupa periksa gigi ke dokter minimal 6 bulan sekali untuk deteksi dan pembersihan dini."
        suggestion = "Menyikat gigi saja tidak cukup untuk membasmi karang gigi yang membandel. Kunjungi dokter gigi untuk pembersihan menyeluruh! Dokter gigi akan menggunakan alat khusus untuk mengangkat plak keras dengan efektif. Tidak perlu khawatir dengan biaya untuk pembersihan karang gigi karena, ditahun 2024 ini BPJS Kesehatan masih menanggung biaya perawatan gigi mulai dari cabut gigi hingga scaling atau membersihkan karang gigi."
      }
    
      if (label === 'Caries') {
        explanation = "Lubang gigi, yang secara medis disebut sebagai dental caries, adalah kerusakan pada struktur gigi yang tidak dapat disembuhkan secara alami. Gigi memiliki lapisan terluar yang keras bernama enamel, namun lapisan ini bisa terkikis oleh proses yang disebut demineralisasi."
        cause = "Lubang gigi tak hanya merusak penampilan, tapi juga mengganggu kesehatan. Penyebab utamanya adalah bakteri di mulut yang gemar gula dan asam, terutama dari makanan dan minuman manis. Kurangnya fluoride dan mulut kering memperparah keadaan. Faktor genetik juga berperan dalam ketahanan gigi. Untuk itu, penting untuk menjaga kebersihan mulut, dan konsumsi makanan sehat."
        prevention = "Kamu bisa mencegah gigi berlubang dengan langkah mudah! Diantaranya, Kurangi camilan manis, batasi makanan dan minuman manis/asam, sikat gigi dua kali sehari dengan pasta berfluoride, bersihkan sela-sela gigi dengan benang gigi, dan periksa gigi ke dokter gigi minimal dua kali setahun. Kebiasaan sederhana ini kunci senyum sehat bebas lubang!"
        suggestion = "Gigi berlubang bisa diobati dengan berbagai cara, tergantung tingkat keparahannya. Penambalan gigi bisa dilakukan jika lubangnya kecil dan tidak dalam. Jika lubangnya besar dan mencapai saraf, perawatan saluran akar diperlukan untuk membersihkan jaringan yang rusak. Untuk kerusakan parah, mahkota gigi bisa dibuat. Jika tidak memungkinkan, pencabutan gigi menjadi pilihan terakhir. Penting untuk berkonsultasi dengan dokter gigi untuk mendapatkan diagnosis dan pengobatan yang tepat. Perawatan dini dapat membantu mencegah kerusakan gigi yang lebih parah dan menjaga kesehatan gigi secara keseluruhan. Ditahun 2024 ini BPJS Kesehatan masih menanggung biaya untuk cabut gigi dengan syarat tertentu."
      }

      if (label === 'Gingivitis') {
        explanation = "Gingivitis adalah peradangan pada gusi yang disebabkan oleh penumpukan plak di sepanjang garis gusi."
        cause = "Gingivitis, atau radang gusi, sering menyerang karena kebiasaan menyikat gigi dan flossing yang tidak tepat. Plak yang menumpuk lama-kelamaan menjadi karang gigi dan memperparah kondisi. Merokok, diabetes, dan perubahan hormon juga bisa menjadi pemicunya."
        prevention = "Gingivitis, atau radang gusi, bisa dicegah dengan langkah mudah. Yaitu dengan Sikat gigi dua kali sehari dengan pasta berfluoride dan floss sekali sehari. Rutin periksa gigi ke dokter gigi minimal 6 bulan sekali. Hindari rokok. Konsultasi dengan dokter jika Anda memiliki kondisi medis tertentu. Kebiasaan sehat ini kunci gusi sehat dan senyum bebas gingivitis!"
        suggestion = "Gingivitis bisa diatasi dengan langkah mudah di rumah, seperti: sikat gigi dua kali sehari dengan sikat gigi berbulu lembut, berkumur dengan obat kumur, minum air putih banyak, batasi makanan manis dan alkohol, berhenti merokok, kontrol gula darah bagi penyandang diabetes, menjaga pola makan sehat, dan periksa gigi ke dokter gigi 6 bulan sekali. Lakukan langkah ini untuk menjaga kesehatan gusi dan senyum Anda. Bila radang gusi tidak kunjung membaik segera periksa ke dokter sebelum terjadinya komplikasi gingivitis."
      }

      if (label === 'Hypodontia') {
        explanation = "Hypodontia adalah kondisi perkembangan gigi di mana seseorang terlahir dengan kekurangan satu atau lebih gigi. Kondisi ini merupakan anomali perkembangan gigi yang paling umum terjadi."
        cause = "Hypodontia bisa disebabkan oleh faktor genetik dan lingkungan. Faktor genetik seperti mutasi gen atau sindrom tertentu seperti Down syndrome berperan penting. Paparan terhadap infeksi, obat-obatan, atau kekurangan nutrisi saat hamil dan masa kanak-kanak juga dapat meningkatkan risiko hypodontia."
        prevention = "Bisakah Hypodontia Dicegah? Sayangnya, karena gangguan pertumbuhan gigi adalah kelainan genetik, hypodontia tidak bisa dicegah. Terkadang, hypodontia bahkan bisa terjadi tanpa penyebab yang pasti."
        suggestion = "Hypodontia dapat diatasi dengan berbagai cara. Pemasangan kawat gigi untuk merapatkan gigi, merekonstruksi bentuk gigi, atau penggunaan gigi palsu seperti denture, dental bridge, dan dental implant adalah beberapa pilihan yang umum dilakukan. Konsultasi dengan dokter gigi penting untuk menentukan solusi terbaik sesuai kondisi dan kebutuhan Anda. Perawatan yang tepat dapat membantu mengembalikan fungsi gigi dan meningkatkan rasa percaya diri dalam tersenyum."
      }

      if (label === 'Discoloration') {
        explanation = "Tooth Discoloration adalah ketika warna gigi Anda berubah. Warna gigi mungkin tampak menguning atau kurang cerah, atau mungkin timbul bintik-bintik putih atau gelap."
        cause = "Perubahan warna gigi dapat disebabkan oleh faktor eksternal seperti megkonsumsi kopi, teh, merokok, dan plak yang menumpuk dapat membuat gigi kuning. Faktor internal seperti obat tertentu, trauma gigi, dan kelebihan fluor saat masa kanak-kanak juga dapat menyebabkan perubahan warna gigi menjadi abu-abu, coklat, kuning, atau berbintik."
        prevention = "Gigi bersih bebas noda bisa Anda dapatkan dengan cara sikat gigi dua kali sehari dengan pasta berfluoride, floss minimal sekali sehari, batasi konsumsi makanan dan minuman pemicu noda, dan hindari rokok. Selain itu, kunjungi dokter gigi minimal 6 bulan sekali untuk pemeriksaan dan pembersihan gigi. Kebiasaan ini membantu mencegah penumpukan plak dan noda, menjaga kesehatan gigi, dan membuat senyum Anda lebih percaya diri."
        suggestion = "Tooth Discoloration dapat diatasi dengan berbagai cara. Dokter gigi dapat melakukan pembersihan gigi profesional untuk menghilangkan plak dan tartar, bleaching untuk memutihkan gigi, atau veneers/bonding untuk menutupi permukaan gigi yang berubah warna. Konsultasikan dengan dokter gigi untuk menentukan perawatan yang tepat sesuai dengan kondisi dan kebutuhan Anda. Dapatkan kembali senyum cerah dan percaya diri dengan perawatan gigi yang tepat."
      }

      if (label === 'Ulcer') {
        explanation = "Oral Ulcer atau biasa yang kita kenal dengan sariawan biasanya muncul sebagai satu atau beberapa luka kecil berbentuk oval di dalam mulut. Luka ini biasanya berwarna putih atau kekuningan dengan batas merah meradang."
        cause = "Sariawan, luka kecil yang tidak nyaman di mulut, dapat muncul karena berbagai faktor. Cedera ringan seperti tergigit, sensitivitas makanan, stres, perubahan hormon, kekurangan nutrisi, kondisi medis tertentu, dan bahkan pasta gigi tertentu dapat memicu sariawan."
        prevention = "Sariawan memang menyebalkan, tapi bisa dicegah! Dengan menjaga kebersihan mulut dengan sikat gigi lembut dua kali sehari dan floss sekali sehari. Kelola stres dengan teknik relaksasi seperti yoga atau meditasi. Hindari makanan yang memicu sariawan dan perbanyak konsumsi vitamin B12, zinc, dan zat besi. Konsultasikan jika sariawan tak kunjung sembuh."
        suggestion = "Sariawan umumnya sembuh dalam 1-2 minggu. Tapi, Anda bisa meredakan rasa perihnya dengan obat oles, mouthwash antiseptik (hindari alkohol!), minum air putih, dan hindari makanan pedas. Konsultasikan dengan dokter jika sariawan tak kunjung sembuh. Dengan perawatan yang tepat, sariawan akan segera membaik dan Anda bisa kembali tersenyum tanpa rasa perih."
      }

      if (label === 'Healthy') {
        explanation = "Gigi anda dalam kondisi yang baik, pertahankan dan tetap jaga kesehatan gigi dan mulut."
        cause = "Kebiasaan baik anda dalam menjaga kesehatan gigi harus dipertahankan untuk tetap memiliki gigi yang sehat dan senyum yang cerah."
        prevention = "Untuk mencegah masalah gigi anda bisa mempertahankan kebiasaan baik yang anda lakukan dalam menjaga kesehatan gigi dan harus dipertahankan untuk tetap memiliki gigi yang sehat dan senyum yang cerah."
        suggestion = "Kebiasaan baik yang anda lakukan untuk menjaga kesehatan gigi sudah baik, dan menjaga kesehatan gigi dan mulut tak hanya soal rajin menyikat gigi. Hindari menyikat gigi terlalu keras, lakukan sebelum tidur, dan gunakan pasta gigi berfluorida. Berhenti merokok, minum air putih lebih banyak, dan batasi konsumsi makanan manis dan asam. Konsumsi makanan bergizi seperti biji-bijian, kacang-kacangan, buah, sayur, dan produk susu untuk melengkapi nutrisi. Kebiasaan ini membantu mencegah gigi berlubang, penyakit gusi, dan bau mulut, serta membuat senyum Anda lebih percaya diri."
      }

      const result = {
        "predictionId": nanoid(16),
        "createdDate": new Date(),
        "result": label,
        "confidenceScore": `${parseFloat(confidenceScore).toFixed(2)}%`,
        "explanation": explanation,
        "cause": cause,
        "prevention": prevention,
        "suggestion": suggestion
    };

    return result;
}

module.exports = predict;
