import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppHeaderBar from '../../components/AppHeaderBar/AppHeaderBar';
import { NEWS_ARTICLES } from '../../assets/newsArticles';
import { ARTICLE_CONTENT } from '../../assets/newsArticleContent';
import './ArticleReader.css';

const ArticleReader = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [article, setArticle] = useState(null);
	const [content, setContent] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [fallback, setFallback] = useState(false);

	useEffect(() => {
		const entry = NEWS_ARTICLES.find((a) => a.id === id);
		if (!entry) {
			setError('Article not found');
			setLoading(false);
			return;
		}
		setArticle(entry);

		// Use manually curated content first – no API call, instant display
		const stored = ARTICLE_CONTENT[id];
		if (stored?.content) {
			setContent({
				title: entry.title,
				content: stored.content,
				byline: stored.byline,
				siteName: stored.siteName,
				originalUrl: entry.url,
			});
			setLoading(false);
			return;
		}

		// Fallback: fetch from API for articles without stored content
		const apiUrl = `/api/article?url=${encodeURIComponent(entry.url)}`;
		fetch(apiUrl)
			.then((res) => res.json())
			.then((data) => {
				if (data.error && data.fallback) {
					setFallback(true);
					setContent(null);
				} else if (data.error) {
					setError(data.error);
					setContent(null);
				} else {
					setContent(data);
					setFallback(false);
				}
			})
			.catch((err) => {
				setError(err.message || 'Failed to load article');
				setFallback(true);
			})
			.finally(() => setLoading(false));
	}, [id]);

	const handleBack = () => navigate('/news');

	if (loading) {
		return (
			<div className="articleReader">
				<AppHeaderBar title="Article" backLabel="News" onBack={handleBack} />
				<div className="articleReaderBody">
					<div className="articleReaderLoading">
						<div className="articleReaderSpinner" />
						<p>Loading article…</p>
					</div>
				</div>
			</div>
		);
	}

	if (error && !fallback) {
		return (
			<div className="articleReader">
				<AppHeaderBar title="Article" backLabel="News" onBack={handleBack} />
				<div className="articleReaderBody">
					<div className="articleReaderError">
						<p>{error}</p>
						{article?.url && (
							<a
								href={article.url}
								target="_blank"
								rel="noopener noreferrer"
								className="articleReaderExternalBtn"
							>
								View on original site
							</a>
						)}
					</div>
				</div>
			</div>
		);
	}

	if (fallback || !content) {
		return (
			<div className="articleReader">
				<AppHeaderBar title={article?.title || 'Article'} backLabel="News" onBack={handleBack} />
				<div className="articleReaderBody">
					<div className="articleReaderFallback">
						<a
							href={article?.url}
							target="_blank"
							rel="noopener noreferrer"
							className="articleReaderExternalBtn"
						>
							Open on original site
						</a>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="articleReader">
			<AppHeaderBar title="Article" backLabel="News" onBack={handleBack} />
			<div className="articleReaderBody">
				<article className="articleReaderArticle">
					{article?.image && (
						<div className={`articleReaderHero ${article.imageFit === 'contain' ? 'articleReaderHero-contain' : ''}`}>
							<img src={article.image} alt="" />
						</div>
					)}
					<header className="articleReaderHeader">
						<h1 className="articleReaderTitle">{content.title || article?.title}</h1>
						{(content.byline || content.siteName) && (
							<p className="articleReaderMeta">
								{[content.byline, content.siteName].filter(Boolean).join(' · ')}
							</p>
						)}
						<p className="articleReaderDate">{article?.date}</p>
					</header>
					<div
						className="articleReaderContent"
						dangerouslySetInnerHTML={{ __html: content.content }}
					/>
					<footer className="articleReaderFooter">
						<a
							href={content.originalUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="articleReaderSourceLink"
						>
							Read on original site
						</a>
					</footer>
				</article>
			</div>
		</div>
	);
};

export default ArticleReader;
