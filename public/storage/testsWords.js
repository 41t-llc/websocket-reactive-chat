const testsWords = [
    'кот', 'собака', 'осел', 'козел', 'лошадь', 'свинья', 'кролик', 'трубкозуб', 'альбатрос', 'аллигатор', 'альпака', 'амфибия', 'анаконда', 'удильщик', 'муравей', 'муравьед', 'антилопа', 'обезьяна', 'тля', 'жерех', 'бабуин', 'барсук', 'бандикут', 'ракушка', 'барракуда', 'василиск', 'бас', 'бобр', 'клоп', 'пчела', 'жук', 'птица', 'бизон', 'удав', 'кабан', 'рысь', 'бонобо', 'мина', 'бовид', 'бабочка', 'канюк', 'верблюд', 'водосвинка', 'кардинал', 'карибу', 'карп', 'гусеница', 'сом', 'сороконожка', 'моллюск', 'хамелеон', 'гепард', 'синица', 'курица', 'шимпанзе', 'шиншилла', 'бурундук', 'кобра', 'таракан', 'треска', 'кондор', 'констриктор', 'пума', 'корова', 'койот', 'краб', 'кран', 'рак', 'крикет', 'крокодил', 'ворона', 'кукушка', 'цикада', 'олень', 'динго', 'динозавр', 'дельфин', 'соня', 'голубь', 'стрекоза', 'дракон', 'утка', 'орел', 'червь', 'уховертка', 'ехидна', 'угорь', 'цапля', 'слон', 'лось', 'эму', 'горностай', 'сокол', 'хорек', 'зяблик', 'светляк', 'фламинго', 'блоха', 'лиса', 'лягушка', 'газель', 'геккон', 'песчанка', 'гиббон', 'жираф', 'гусь', 'суслик', 'горилла', 'кузнечик', 'рябчик', 'гуань', 'гуанако', 'цесарка', 'чайка', 'гуппи', 'пикша', 'палтус', 'хомяк', 'заяц', 'лунь', 'ястреб', 'ежик', 'сельдь', 'бегемот', 'анкилостома', 'шершень', 'журчалка', 'колибри', 'гиена', 'игуана', 'импала', 'шакал', 'ягуар', 'медуза', 'кенгуру', 'зимородок', 'змей', 'киви', 'коала', 'кои', 'криль', 'минога', 'жаворонок', 'пиявка', 'лемминг', 'лемур', 'леопард', 'леопон', 'лимпет', 'лев', 'ящерица', 'лама', 'омар', 'саранча', 'гагара', 'вошь', 'ара', 'скумбрия', 'сорока', 'ламантин', 'мандрил', 'марлин', 'мартышка', 'сурок', 'куница', 'мастодонт', 'медоуларк', 'сурикат', 'норка', 'пескарь', 'клещ', 'пересмешник', 'моль', 'мангуст', 'комар', 'мышь', 'мул', 'овцебык', 'нарвал', 'тритон', 'соловей', 'оцелот', 'осьминог', 'опоссум', 'орангутанг', 'страус', 'выдра', 'сова', 'бык', 'панда', 'пантера', 'попугай', 'куропатка', 'павлин', 'пеликан', 'пингвин', 'окунь', 'фазан', 'щука', 'пиранья', 'планарий', 'утконос', 'пони', 'дикобраз', 'креветка', 'примас', 'тупик', 'питон', 'перепела', 'енот', 'крыса', 'змея', 'ворон', 'рептилия', 'носорог', 'грызун', 'ладья', 'петух', 'аскариды', 'парусник', 'саламандра', 'лосось', 'гребешок', 'скорпион', 'акула', 'овец', 'землеройка', 'шелкопряд', 'сцинк', 'скунс', 'слизняк', 'корюшка', 'улитка', 'бекас', 'воробей', 'паук', 'колпица', 'кальмар', 'белка', 'скат', 'аист', 'осетр', 'ласточка', 'лебедь', 'тар', 'такин', 'тапир', 'тарантул', 'долгопят', 'термит', 'крачка', 'дрозд', 'тигр', 'тиглон', 'жаба', 'черепаха', 'тукан', 'форель', 'тунец', 'индюк', 'тиранозавр', 'уриал', 'викунья', 'гадюка', 'полевка', 'гриф', 'валлаби', 'морж', 'оса', 'ласка', 'кит', 'сиг', 'дичь', 'волк', 'росомаха', 'вомбат', 'дятел', 'крапивник', 'як', 'зебра', 'гаял'
]