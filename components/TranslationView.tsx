import React, { useState } from 'react';
import { Textarea, Button, FormControl, Typography, Card, Stack, Slider, FormLabel } from '@mui/joy';
import ToggleGroup from '../components/ToggleGroup';
import LanguageSelector from '../components/LanguageSelector';
import { PossibleTranslationLanguages } from '../data/PossibleTranslationLanguages';
import DropZone from '../components/DropZone';
import axios from 'axios';
import TranslatedResponseTable from '../components/TranslatedResponseTable';
import { API_URL } from '../config'; 

interface APIResponse {
    data: any;
}

export const TranslationView: React.FC = () => {
    const [response, setResponse] = useState<APIResponse | null>(null);
    const [textOrFile, setTextOrFile] = useState<string>("text");
    const [text, setText] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);
    const [inputLanguage, setInputLanguage] = useState<string>("auto");
    const [outputLanguage, setOutputLanguage] = useState<string>("en");
    const [minWordSize, setMinWordSize] = useState<number>(2);
    const [minAppearances, setMinAppearances] = useState<number>(1);

    const [loading, setLoading] = useState(false);
    const handleSubmit = async () => {
        setLoading(true);
        
        try {
            if ((textOrFile === 'text' && text === '') || (textOrFile === 'file' && file === null)) {
                throw new Error('Please provide input text or select a file');
            }
            const formData = new FormData();
            formData.append('subs_language', inputLanguage);
            formData.append('target_language', outputLanguage);
            formData.append('min_word_size', minWordSize.toString());
            formData.append('min_appearance', minAppearances.toString());

            if (textOrFile === 'text') {
                formData.append('text', text);
            } else if (file !== null) {
                formData.append('file', file);
            }
            if (API_URL === undefined) {
                throw new Error('API_URL not defined');
            }
            const res = await axios.post(API_URL, formData);
            setResponse(res);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1, sm: 2, md: 4 }}
            justifyContent="center"
            alignItems="center"
        >
            <Card variant="outlined" sx={{ boxShadow: 2 }}>
                <Typography
                    level="h1"
                    fontWeight="xl"
                    textAlign="center"
                    sx={{ mb: 6, mt: 3 }}
                >
                    Script Vocab
                </Typography>
                <FormControl sx={{ flex: 1, gap: 1 }}>
                    <ToggleGroup
                        label="Input Type"
                        options={[
                            { label: 'Text', value: 'text' },
                            { label: 'File', value: 'file' },
                        ]}
                        onChange={(value) => {
                            setTextOrFile(value)
                        }}
                    />
                    {textOrFile === 'text' ? (
                        <Textarea
                            placeholder="Enter text here"
                            sx={{ height: 132, width: 300 }}
                            onChange={(event) => {
                                setText(event.target.value)
                            }}
                        />
                    ) :
                        <DropZone
                            onDrop={(files) => {
                                setFile(files[0]);
                            }
                            }
                            sx={{ height: 132, width: 300 }}
                        />
                    }
                    <LanguageSelector label='Input Language' options={[{ code: 'auto', label: 'Auto' }, ...PossibleTranslationLanguages]}
                        onChange={(value) => {
                            setInputLanguage(value)
                        }}
                    />
                    <LanguageSelector label='Output Language' options={PossibleTranslationLanguages}
                        onChange={(value) => {
                            setOutputLanguage(value)
                        }} />
                    <div><FormLabel sx={{ mb: 0, mt: 1 }}>Minimum Word Size</FormLabel>
                        <Slider
                            aria-label="Minimum Word Size"
                            defaultValue={2}
                            onChange={(_e, value) => {
                                if (typeof value === 'number') {
                                    setMinWordSize(value);
                                }
                            }}
                            step={1}
                            min={1}
                            max={20}
                            valueLabelDisplay="auto"
                            sx={{ p: 0 }}
                        /></div>
                    <div><FormLabel sx={{ mb: 0, mt: 1 }}>Minimum Appearances</FormLabel>
                        <Slider
                            aria-label="Minimum Appearances"
                            defaultValue={1}
                            onChange={(_e, value) => {
                                if (typeof value === 'number') {
                                    setMinAppearances(value);
                                }
                            }}
                            step={1}
                            min={1}
                            max={20}
                            valueLabelDisplay="auto"
                            sx={{ p: 0 }}
                        /></div>

                    <Button
                        loading={loading}
                        onClick={handleSubmit}
                        sx={{ mt: 2 }}>
                        Submit
                    </Button>
                </FormControl>
            </Card>
            {response && (
                <TranslatedResponseTable response={response} />
            )}
        </Stack>
    );
};