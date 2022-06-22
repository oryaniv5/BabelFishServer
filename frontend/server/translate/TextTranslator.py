from googletrans import Translator

class TextTranslator:
    def __init__(self, dest_language):
        self.translator = Translator()
        self.dest_language = dest_language
        
    def Translate(self, text):
        return self.translator.translate(text, dest=self.dest_language).text

