import { useState, type FormEvent } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { useLang } from '@/lib/i18n';

export function ContactShowcase() {
    const { t } = useLang();
    const [lampIsOn, setLampIsOn] = useState(false);
    const [formIsOpen, setFormIsOpen] = useState(false);

    const toggleLamp = () => {
        setLampIsOn(!lampIsOn);
        if (lampIsOn) {
            setFormIsOpen(false);
        }
    };

    const sendMessage = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const subject = encodeURIComponent(
            `${formData.get('subject')} — ${formData.get('name')}`,
        );
        const body = encodeURIComponent(
            `${t('contactFormEmailLabel')}: ${formData.get('email')}\n\n${formData.get('message')}`,
        );

        window.location.href = `mailto:hello@example.com?subject=${subject}&body=${body}`;
    };

    return (
        <section id="kontak" className="contact-section" aria-labelledby="contact-title">
            <h2 id="contact-title" className="contact-title">
                {t('contact')}
            </h2>
            <p className="contact-hint">{t('contactLampHint')}</p>

            <div className="contact-light-stage">
                <button
                    type="button"
                    className={`bell-container${lampIsOn ? '' : ' off'}`}
                    aria-label={lampIsOn ? t('turnLampOff') : t('turnLampOn')}
                    aria-pressed={lampIsOn}
                    onClick={toggleLamp}
                >
                    <span className="rope" />
                    <span className="bell-top" />
                    <span className="bell-base" />
                    <span className="bell-base" />
                    <span className="shadow-l1" />
                    <span className="shadow-l2" />
                    <span className="left-glow" />
                    <span className="left-glow2" />
                    <span className="r-glow" />
                    <span className="r-glow2" />
                    <span className="mid-ring" />
                    <span className="mid-ring small" />
                    <span className="glow" />
                    <span className="glow2" />
                    <span className="bell-buff-t" />
                    <span className="bell-buff" />
                    <span className="bell-btm" />
                    <span className="bell-btm2" />
                    <span className="bell-ring-container">
                        <span className="bell-ring" />
                        <span className="bell-rays" />
                    </span>
                    <span className="volumetric">
                        <span className="vl" />
                        <span className="vr" />
                    </span>
                </button>

                <button
                    type="button"
                    className={`contact-message-trigger button${lampIsOn ? ' is-visible' : ''}`}
                    tabIndex={lampIsOn ? 0 : -1}
                    aria-hidden={!lampIsOn}
                    onClick={() => setFormIsOpen((isOpen) => !isOpen)}
                >
                    {formIsOpen ? t('contactFormClose') : t('contactSendMessage')}
                </button>

                {formIsOpen && (
                    <button
                        type="button"
                        className="contact-form-backdrop"
                        aria-label={t('contactFormClose')}
                        onClick={() => setFormIsOpen(false)}
                    />
                )}

                <form
                    className={`contact-form${formIsOpen ? ' is-open' : ''}`}
                    aria-label={t('contactFormTitle')}
                    aria-hidden={!formIsOpen}
                    aria-modal={formIsOpen}
                    role="dialog"
                    onSubmit={sendMessage}
                >
                    <div className="contact-form-header">
                        <h3>{t('contactFormTitle')}</h3>
                        <button
                            className="contact-form-close"
                            type="button"
                            aria-label={t('contactFormClose')}
                            tabIndex={formIsOpen ? 0 : -1}
                            onClick={() => setFormIsOpen(false)}
                        >
                            <X aria-hidden="true" />
                        </button>
                    </div>
                    <label>
                        <span>{t('contactFormNameLabel')}</span>
                        <input autoComplete="name" name="name" required tabIndex={formIsOpen ? 0 : -1} />
                    </label>
                    <label>
                        <span>{t('contactFormEmailLabel')}</span>
                        <input autoComplete="email" name="email" type="email" required tabIndex={formIsOpen ? 0 : -1} />
                    </label>
                    <label>
                        <span>{t('contactFormSubjectLabel')}</span>
                        <input name="subject" required tabIndex={formIsOpen ? 0 : -1} />
                    </label>
                    <label>
                        <span>{t('contactFormMessageLabel')}</span>
                        <textarea name="message" rows={4} required tabIndex={formIsOpen ? 0 : -1} />
                    </label>
                    <button className="contact-form-submit" type="submit" tabIndex={formIsOpen ? 0 : -1}>
                        {t('contactFormSubmit')}
                        <ArrowUpRight aria-hidden="true" />
                    </button>
                </form>
                <div className="contact-grain" aria-hidden="true" />
            </div>
        </section>
    );
}
