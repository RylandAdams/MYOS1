import React from 'react';
import { Link } from 'react-router-dom';
import './news.css';
import AppHeaderBar from '../../components/AppHeaderBar/AppHeaderBar';
import { NEWS_ARTICLES } from '../../assets/newsArticles';

const News = () => {
	return (
		<div className="newsPage">
			<AppHeaderBar title="News" />
			<div className="newsScroll">
				{NEWS_ARTICLES.map((article) =>
					article.externalOnly ? (
						<a
							key={article.id}
							href={article.url}
							target="_blank"
							rel="noopener noreferrer"
							className="newsRow"
						>
							<div className={`newsRowThumb ${article.imageFit === 'contain' ? 'newsRowThumb-contain' : ''}`}>
								<img src={article.image} alt="" />
							</div>
							<div className="newsRowText">
								<h3 className="newsRowTitle">{article.title}</h3>
								<p className="newsRowExcerpt">{article.excerpt}</p>
								<p className="newsRowDate">{article.date}</p>
							</div>
						</a>
					) : (
						<Link
							key={article.id}
							to={`/news/${article.id}`}
							className="newsRow"
						>
							<div className={`newsRowThumb ${article.imageFit === 'contain' ? 'newsRowThumb-contain' : ''}`}>
								<img src={article.image} alt="" />
							</div>
							<div className="newsRowText">
								<h3 className="newsRowTitle">{article.title}</h3>
								<p className="newsRowExcerpt">{article.excerpt}</p>
								<p className="newsRowDate">{article.date}</p>
							</div>
						</Link>
					)
				)}
			</div>
		</div>
	);
};

export default News;
