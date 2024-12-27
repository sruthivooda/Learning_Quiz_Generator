
from nltk.tokenize import sent_tokenize
from huggingface_hub import login,hf_hub_download

import streamlit as st

import requests
from bs4 import BeautifulSoup

# Login using your Hugging Face token
#login("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")


# Download NLTK data (run this once)
#nltk.download('punkt')

import torch
from pathlib import Path
from torch.utils.data import Dataset, DataLoader
import pytorch_lightning as pl
from pytorch_lightning.callbacks import ModelCheckpoint
from sklearn.model_selection import train_test_split
from transformers import (
    AdamW,
    T5ForConditionalGeneration,
    T5TokenizerFast as T5Tokenizer
    )

# Constants
MODEL_NAME = 't5-small'
LEARNING_RATE = 0.0001
SOURCE_MAX_TOKEN_LEN = 300
TARGET_MAX_TOKEN_LEN = 80
SEP_TOKEN = '<sep>'
TOKENIZER_LEN = 32101 #after adding the new <sep> token

# QG Model
class QGModel(pl.LightningModule):
    def __init__(self):
        super().__init__()
        self.model = T5ForConditionalGeneration.from_pretrained(MODEL_NAME, return_dict=True)
        self.model.resize_token_embeddings(TOKENIZER_LEN) #resizing after adding new tokens to the tokenizer

    def forward(self, input_ids, attention_mask, labels=None):
        output = self.model(input_ids=input_ids, attention_mask=attention_mask, labels=labels)
        return output.loss, output.logits

    def training_step(self, batch, batch_idx):
        input_ids = batch['input_ids']
        attention_mask = batch['attention_mask']
        labels = batch['labels']
        loss, output = self(input_ids, attention_mask, labels)
        self.log('train_loss', loss, prog_bar=True, logger=True)
        return loss

    def validation_step(self, batch, batch_idx):
        input_ids = batch['input_ids']
        attention_mask = batch['attention_mask']
        labels = batch['labels']
        loss, output = self(input_ids, attention_mask, labels)
        self.log('val_loss', loss, prog_bar=True, logger=True)
        return loss

    def test_step(self, batch, batch_idx):
        input_ids = batch['input_ids']
        attention_mask = batch['attention_mask']
        labels = batch['labels']
        loss, output = self(input_ids, attention_mask, labels)
        self.log('test_loss', loss, prog_bar=True, logger=True)
        return loss
  
    def configure_optimizers(self):
        return AdamW(self.parameters(), lr=LEARNING_RATE)


class QuestionGenerator():
    def __init__(self):
        self.tokenizer = T5Tokenizer.from_pretrained(MODEL_NAME)
        # print('tokenizer len before: ', len(self.tokenizer))
        self.tokenizer.add_tokens(SEP_TOKEN)
        # print('tokenizer len after: ', len(self.tokenizer))
        self.tokenizer_len = len(self.tokenizer)

        checkpoint_path = hf_hub_download(repo_id="rohithbandi1/fine-tuned-t5-aiquiz", filename="model.ckpt")
        #self.qg_model = QGModel.load_from_checkpoint(checkpoint_path)
        self.qg_model = QGModel.load_from_checkpoint(checkpoint_path)
        self.qg_model.freeze()
        self.qg_model.eval()

    def generate(self, question_type:str, context: str ) -> str:
        model_output = self._model_predict(question_type, context)

        #generated_type, generated_question ,generated_answer= model_output.split('<sep>')

        return model_output
    
    def _model_predict(self, question_type:str, context: str ) -> str:
        source_encoding = self.tokenizer(
            '{} {} {}'.format(question_type,SEP_TOKEN, context),
            max_length= SOURCE_MAX_TOKEN_LEN,
            padding='max_length',
            truncation= True,
            return_attention_mask=True,
            add_special_tokens=True,
            return_tensors='pt'
            )

        generated_ids = self.qg_model.model.generate(
            input_ids=source_encoding['input_ids'],
            attention_mask=source_encoding['attention_mask'],
            num_beams=16,
            max_length=TARGET_MAX_TOKEN_LEN,
            repetition_penalty=2.5,
            length_penalty=1.0,
            early_stopping=True,
            use_cache=True
        )

        preds = {
            self.tokenizer.decode(generated_id, skip_special_tokens=True, clean_up_tokenization_spaces=True)
            for generated_id in generated_ids
        }

        return ''.join(preds)


def split_into_chunks(text, max_sentences_per_chunk=5):
    # Tokenize paragraph into sentences
    sentences = sent_tokenize(text)
    
    # Split sentences into chunks
    chunks = []
    for i in range(0, len(sentences), max_sentences_per_chunk):
        chunk = " ".join(sentences[i:i + max_sentences_per_chunk])
        chunks.append(chunk)
    
    return chunks


def get_geeksforgeeks_content(url):
    """Fetch and extract meaningful content from a GeeksforGeeks article."""
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract the article title
            title = soup.find('h1').get_text(strip=True)
            
            # Extract content within <article> or other main content sections
            content_section = soup.find('div', {'class': 'entry-content'})
            if not content_section:
                content_section = soup.find('article')
            
            # Extract paragraphs from the main content section
            paragraphs = content_section.find_all('p')
            content = ' '.join([para.get_text(strip=True) for para in paragraphs])
            
            return f"Title: {title}\n\nContent:\n{content}"
        else:
            return f"Failed to retrieve content. HTTP Status Code: {response.status_code}"
    except Exception as e:
        return f"Error occurred: {e}"
    


# if __name__ == "__main__":
#     # Provide options to the user with keywords only
#     urls = {
#         1: ("ER Model", "https://www.geeksforgeeks.org/introduction-of-er-model/"),
#         2: ("Database Normalization", "https://www.geeksforgeeks.org/introduction-of-database-normalization/"),
#         3: ("Concurrency Control", "https://www.geeksforgeeks.org/concurrency-control-in-dbms/"),
#         4: ("History of DBMS", "https://www.geeksforgeeks.org/history-of-dbms/"),
#         5: ("Relational Model", "https://www.geeksforgeeks.org/introduction-of-relational-model-and-codd-rules-in-dbms/"),
#     }

#     print("Select a topic to scrape and generate questions from:")
#     for key, (keyword, _) in urls.items():
#         print(f"{key}: {keyword}")

#     # Get user input for topic selection
#     selected_key = int(input("Enter the number corresponding to your choice: "))
#     if selected_key not in urls:
#         print("Invalid selection. Please restart the script.")
#         exit()

#     _, selected_url = urls[selected_key]

#     # Scrape content from the selected URL
#     print("\nFetching and processing content from the selected topic...")
#     context = get_geeksforgeeks_content(selected_url)
#     if "Failed to retrieve content" in context or "Error occurred" in context:
#         print(context)
#         exit()

#     # Chunk the scraped content
#     chunks = split_into_chunks(context, max_sentences_per_chunk=3)
#     num_chunks = len(chunks)
#     print(f"\nContent split into {num_chunks} chunks.")

#     # Prompt user to select the number of questions to generate
#     print(f"\nEnter the number of questions to generate (min: 1, max: {num_chunks}):")
#     num_questions = int(input("Number of questions: "))
#     if not (1 <= num_questions <= num_chunks):
#         print("Invalid number of questions. Please restart the script.")
#         exit()

#     # Initialize the Question Generator
#     qg = QuestionGenerator()

#     # Question generation logic
#     question_types = ["fill_in_the_blanks", "mcq", "True_or_false", "short_qa"]
#     all_generated_questions = {q_type: [] for q_type in question_types}

#     print(f"\nGenerating {num_questions} questions...")
#     for i, chunk in enumerate(chunks[:num_questions]):  # Limit to the selected number of chunks
#         for q_type in question_types:
#             question = qg.generate(q_type, chunk)
#             all_generated_questions[q_type].append((chunk, question))  # Pair with the context for reference

#     # Display the generated questions
#     for q_type in question_types:
#         print(f"\nGenerated {q_type.replace('_', ' ').capitalize()} Questions:")
#         for idx, (chunk, question) in enumerate(all_generated_questions[q_type], 1):
#             print(f"Context {idx}: {chunk}")
#             print(question, "\n")



# Main function for Streamlit app
def main():
    st.title("AI Question Generator")

    # Define URLs with keywords
    urls = {
        1: ("ER Model", "https://www.geeksforgeeks.org/introduction-of-er-model/"),
        2: ("Database Normalization", "https://www.geeksforgeeks.org/introduction-of-database-normalization/"),
        3: ("Concurrency Control", "https://www.geeksforgeeks.org/concurrency-control-in-dbms/"),
        4: ("History of DBMS", "https://www.geeksforgeeks.org/history-of-dbms/"),
        5: ("Relational Model", "https://www.geeksforgeeks.org/introduction-of-relational-model-and-codd-rules-in-dbms/"),
    }

    # Step 1: Select a topic
    st.header("Step 1: Choose a topic")
    selected_key = st.selectbox("Select a topic to scrape and generate questions from:", 
                                 options=list(urls.keys()), 
                                 format_func=lambda key: urls[key][0])

    selected_keyword, selected_url = urls[selected_key]

    # Step 2: Scrape content
    st.header("Step 2: Scraping the content")
    if st.button(f"Fetch Content for {selected_keyword}"):
        with st.spinner(f"Scraping content from {selected_keyword}..."):
            context = get_geeksforgeeks_content(selected_url)
            if "Failed to retrieve content" in context or "Error occurred" in context:
                st.error("Failed to retrieve content. Please try again.")
                st.stop()

            # Chunk the scraped content
            chunks = split_into_chunks(context, max_sentences_per_chunk=3)
            num_chunks = len(chunks)
            st.success(f"Content successfully fetched and split into {num_chunks} chunks!")
            st.session_state["chunks"] = chunks

    # Ensure chunks are available
    if "chunks" not in st.session_state:
        st.warning("Please fetch the content before proceeding.")
        st.stop()

    # Step 3: Select number of questions to generate
    st.header("Step 3: Select the number of questions to generate")
    chunks = st.session_state["chunks"]
    num_chunks = len(chunks)
    num_questions = st.slider("Select the number of questions to generate:", min_value=1, max_value=num_chunks, value=1)

    # Step 4: Generate questions
    st.header("Step 4: Generate Questions")
    if st.button("Generate Questions"):
        with st.spinner(f"Generating {num_questions} questions..."):
            qg = QuestionGenerator()
            question_types = ["mcq", "True_or_false", "short_qa","fill_in_the_blanks"]
            all_generated_questions = {q_type: [] for q_type in question_types}

            for i, chunk in enumerate(chunks[:num_questions]):  # Limit to the selected number of chunks
                for q_type in question_types:
                    question = qg.generate(q_type, chunk)
                    all_generated_questions[q_type].append((chunk, question))  # Pair with the context for reference

            # Display questions
            for q_type in question_types:
                st.subheader(f"{q_type.replace('_', ' ').capitalize()} Questions")
                for idx, (chunk, question) in enumerate(all_generated_questions[q_type], 1):
                    with st.expander(f"Question {idx}"):
                        st.write(f"**Context**: {chunk}")
                        st.write(f"**Question**: {question}")

# Run the Streamlit app
if __name__ == "__main__":
    main()
